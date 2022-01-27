// ******************** UI Methods  - Basic Handling

const assignNewIdentity = async function() {
  const Identity = new WebClient.Identity();
  const identity = Identity.getIdentity();
  window.localStorage.setItem("identity",JSON.stringify(identity));
  window.identity = identity;
}

const profileEditorSet = function(data) {
  window.editorProfile.set(data);
  let childData = {};

  for (const [key, value] of Object.entries(data)) {
     childData[key] = {
       read:true,
       write:false
     }
  }
  window.editorChild.set(childData);
}

const updateTransport = async function() {
    let data = {
        credential:window.childIdentity.address,
        maintainer:location.protocol + '//' + location.hostname + ':' + location.port + '/'
    }
    // window.editorTransport.set(data);
    let builder = new WebClient.JWTBuilder({identity:window.identity});
    $('#jwtTransport').html(await builder.toJWT(data));
}

const updateBalance = function() {
  const identity = new WebClient.Identity();
  // CORS might avoid this - so we ignore and wait until we get it from the server
  try {
    let txblock = false;
    identity.getBalance(window.identity.address).then(function(balance) {
      $('#txBalance').html(balance);
      $('#etherId').attr('title','Gas: '+balance);
      if(balance < 10) {
        txblock=true;
        $('#etherId').addClass("bg-danger");
        $.getJSON("https://api.corrently.io/v2.0/idideal/devmode?account="+window.identity.address,function(data) {
          if(typeof data.nonce !== 'undefined') {
            setTimeout(function() {
              location.reload();
            },15000);
          }
        });
      } else {
        $('#etherId').removeClass("bg-danger");
      }
    });
    identity.getBalance(window.childIdentity.address).then(function(balance) {
      $('#childTxBalance').html(balance);
      $('#childEtherId').attr('title','Gas: '+balance);
      if(balance < 10) {
        $('#childEtherId').addClass("bg-danger");
        setTimeout(function() {
        if(!txblock) {
            $.getJSON("https://api.corrently.io/v2.0/idideal/devmode?account="+window.childIdentity.address,function(data) {
              if(typeof data.nonce !== 'undefined') {
                setTimeout(function() {
                  location.reload();
                },15000);
              }
            });
        }
      },2000);
      } else {
        $('#childEtherId').removeClass("bg-danger");
      }
    });
  } catch(e) {console.log(e);}
}

const updateProfile = async function() {
  return;
}

const writeTest = async function() {
  $('#btnWriteTest').attr('disabled','disabled');
  let builder = new WebClient.JWTBuilder({identity:window.identity});
  let payload = {reading: 1234, email: 'alice@domain.org'};
  const did = {did:await builder.toJWT(payload)};
  $.ajax({
    type: "POST",
    url: "/api/profile/update",
    data:did,
    success: function(data) {
      console.log(data);
      $('#btnWriteTest').removeAttr('disabled');
    }
  });
}
const grantChild = async function() {
  let builder = new WebClient.JWTBuilder({identity:window.identity});
  let payload = {
    address:window.childIdentity.address,
    permissions:window.editorChild.get()
  }

  const did = {did:await builder.toJWT(payload)};

  $.ajax({
    type: "POST",
    url: "/api/grant/update",
    data:did,
    success: function(data) {

    }
  });
}

const setPermission = async function() {
  let builder = new WebClient.JWTBuilder({identity:window.identity});
  let payload = {
    address:window.childIdentity.address,
    permissions:{"reading":{"read":true,"write":false},"email":{"read":false,"write":false}}
  }

  const did = {did:await builder.toJWT(payload)};

  $.ajax({
    type: "POST",
    url: "/api/grant/update",
    data:did,
    success: function(data) {
      console.log(data);
    }
  });
}

const grantRetrieve = async function() {
  let builder = new WebClient.JWTBuilder({identity:window.identity});
  let payload = {
    address:window.childIdentity.address,
    permissions:window.editorChild.get()
  }

  const did = {did:await builder.toJWT(payload)};
  $.getJSON("/api/grant/retrieve?address="+window.childIdentity.address+"&owner="+encodeURIComponent('did:ethr:'+window.identity.identifier),function(data) {
    window.editorChild.set(data);
  });
}

// ******************** UI Methods  - Sub ID Handling / Assignment

const assignNewChildId = function() {
  const Identity = new WebClient.Identity();
  const identity = Identity.getIdentity();
  window.localStorage.setItem("childId",JSON.stringify(identity));
  window.childIdentity = identity;
}

const delegateToPrimary = async function() {
  const childObject = new WebClient.Identity(window.childIdentity);
  console.log(await childObject.delegate(window.childIdentity.address,window.identity.address,86400000));
}

const delegateChild = async function() {
  const childObject = new WebClient.Identity(window.childIdentity);
  console.log(await childObject.delegate(window.childIdentity.address,$('#delegateTo').val(),86400000));
}

const retrieveVP = async function() {
  let builder = new WebClient.JWTBuilder({identity:window.identity});
  let payload = window.editorVP.get();
  if(typeof payload !== 'object') {
    payload = { value:payload };
  }
  const did = {did:await builder.toJWT(payload,$('#retrieveFrom').val())};
  $.ajax({
    type: "POST",
    url: "/api/profile/update",
    data:did,
    success: function(data) {
      window.editorVP.set(data);
    }
  });
}

// ******************** Bootstrap
$(document).ready(async function() {

  window.identity = window.localStorage.getItem("identity");
  if((typeof window.identity == 'undefined') || (window.identity == null)) {
    assignNewIdentity();
  } else {
    try {
      window.identity = JSON.parse(window.identity);
    } catch(e) {
      assignNewIdentity();
    }
  }
  $('#browserId').html(window.identity.identifier);
  $('#etherId').html(window.identity.address);



  //  Child ID Handling
  window.childIdentity = window.localStorage.getItem("childId");
  if((typeof window.childIdentity == 'undefined') || (window.childIdentity == null)) {
    assignNewChildId();
  } else {
    try {
      window.childIdentity = JSON.parse(window.childIdentity);
    } catch(e) {
      assignNewChildId();
    }
  }
  updateTransport();
  $('#childBrowserId').html(window.childIdentity.identifier);
  $('#childEtherId').html(window.childIdentity.address);

  // General Backend refresh
  updateProfile();
  updateBalance();

  /// Add Event handlers
  $('#btnDelegateToPrimary').click(delegateToPrimary);
  $('#btnUpdate').click(updateProfile);
  $('#btnGrantChild').click(grantChild);
  $('#btnGrantRetrieve').click(grantRetrieve);
  $('#btnDelegateChild').click(delegateChild);
  $('#btnRetrieveVP').click(retrieveVP);
  $('#btnWriteTest').click(writeTest);
  $('#btnSetPermission').click(setPermission);

})
