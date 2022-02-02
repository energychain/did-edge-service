"use strict";

const level = require('level');
const jwtdecode = require("jsontokens").decodeToken;
const jwtverify = require("jsontokens").TokenVerifier;

let db = {};

module.exports = {
	name: "oauth",
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
				method: "GET",
				path: "/callback"
			},
      visibility:'published',
			params: {
			     id_token:"string"
			},
			async handler(ctx) {
        
        return {
          decode:jwtdecode(ctx.params.id_token)
        }
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
