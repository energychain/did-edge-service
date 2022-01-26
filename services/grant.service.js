"use strict";

const memstorage = {};

module.exports = {
	name: "grant",
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
						if(typeof memstorage[did.payload.address]  == 'undefined') memstorage[did.payload.address] = {};
						if(typeof memstorage[did.payload.address][issuer]  == 'undefined') memstorage[did.payload.address][issuer] = {};
						memstorage[did.payload.address][issuer] = did.payload.permissions;
						response =  memstorage[did.payload.address][issuer];
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
    },
		retrieve: {
			rest: {
				method: "GET",
				path: "/retrieve"
			},
			visibility:'published',
			params: {
					 address:"string"
			},
			async handler(ctx) {
				if(typeof memstorage[ctx.params.address]  == 'undefined') memstorage[ctx.params.address] = {};
				return memstorage[ctx.params.address];
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
