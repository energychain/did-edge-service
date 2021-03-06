"use strict";

const level = require('level')
let db = {};

module.exports = {
	name: "grant",
	/**
	 * Settings
	 */
	settings: {
 		resolver:{
 			rpcUrl:"https://rpc.tydids.com/",
 			chainId: "6226",
 			registry:"0xaC2DDf7488C1C2Dd1f8FFE36e207D8Fb96cF2fFB",
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
						let grants = {};
						try {
							grants = JSON.parse(await db.get(did.payload.address));
						} catch(e) {}
						if(typeof grants  == 'undefined') grants = {};
						if(typeof grants[issuer]  == 'undefined') grants[issuer] = {};
						grants[issuer] = did.payload.permissions;
						response =  grants[issuer];
						await db.put(did.payload.address,JSON.stringify(grants));
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
				let value = "{}";
				try {
					value = await db.get(ctx.params.address);
				} catch(e) {

				}
				return await JSON.parse(value);
			}
		},
		retrieveDelegated: {
			rest: {
				method: "GET",
				path: "/retrieveDelegated"
			},
			visibility:'published',
			params: {
					 address:"string"
			},
			async handler(ctx) {
				let value = "{}";
				try {
					value = await db.get(ctx.params.address);
				} catch(e) {
						console.log("rD(e)",e);
				}
				return await JSON.parse(value);
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
		db = level('grants')
	},

	async stopped() {

	}
};
