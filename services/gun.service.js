"use strict";

const level = require('level');
const Gun = require('gun');
const http = require('http');
let gun = {};

module.exports = {
	name: "gun",
	/**
	 * Settings
	 */
	settings: {

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
		var server = http.Server();
		const port = 8899;

		// Serves up /index.html
		server.on('request', function (req, res) {
			if(Gun.serve(req, res)){ return }
			if (req.url === '/' || req.url === '/index.html') {
				// res.redirect('https://tydids.com/?err=fromWebRTC');
			}
		});

		gun = Gun({
			web: server,
			peers: ['https://webrtc.tydids.com/gun']
		});


		server.listen(port, function () {
			console.log('\nApp listening on port', port);
		});

	},

	async stopped() {

	}
};
