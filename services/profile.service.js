"use strict";

const memstorage = {};

module.exports = {
	name: "profile",
	/**
	 * Settings
	 */
	settings: {
 		resolver:{
 			rpcUrl:"https://integration.corrently.io/",
 //			name: "mainnet",
 			chainId: "6226",
 			registry:"0xda77BEeb5002e10be2F5B63E81Ce8cA8286D4335",
 			identifier:'0x0292c844af71ae69ec7cb67b37462ced2fea4277ba8174754013f4311367e78ea4'
 		}
 	},
	/**
	 * Dependencies
	 */
	dependencies: [],

	/**
	 * Actions
	 */
	actions: {
		/**
		 * @returns identity
		 */
		update: {
			rest: {
				method: "POST",
				path: "/update"
			},
      visibility:'published',
			params: {
			     did:"string"
			},
			async handler(ctx) {
					let response = {type:'CONTRL'};

					const JWTResolver = require("did-wallet-web").JWTResolver;
					const resolver = new JWTResolver(this.settings.resolver);
					let did = { issuer: 'internal:0x0',payload:{} }
					try {
						did = await resolver.toDid(ctx.params.did);
						let issuer = did.signer.blockchainAccountId.substr(0,42);
						let owner = did.issuer.substr(14,42);
						if(typeof memstorage[owner]  == 'undefined') memstorage[owner] = {};
						if(owner == issuer) {
							for (const [key, value] of Object.entries(did.payload)) {
							  memstorage[owner][key] = value;
							}
							response =  memstorage[owner];
						} else {
							const permissions = await ctx.call("grant.retrieve",{address:owner,owner:owner});
							let tennentObject = {};
							let parentAccount = '';
							for (const [key, value] of Object.entries(permissions)) {
								parentAccount = key;
							}
							for (const [key, value] of Object.entries(permissions[parentAccount])) {
								if(typeof  memstorage[parentAccount] !== 'undefined') {
										if(value.read) {
											tennentObject[key] = memstorage[parentAccount][key];
										}
										if(value.write) {
												memstorage[parentAccount][key] = did.payload[key];
												tennentObject[key] = did.payload[key];
										}
								}
							}
							response = tennentObject;
						}
					} catch(e) {
						console.log(e);
						response.type = 'APERAK';
						response.error = e.message;
					}
					if(response.error == 'undefined') {
								console.log(did);
					}
					return response;
			}
    }
	},


	events: {

	},

	methods: {

	},


	created() {

	},

	async started() {

	},

	async stopped() {

	}
};
