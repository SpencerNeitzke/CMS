module.exports.get = function(req, res) {
	var data = {
			boxes: [
				{
					title: "Video views today",
					data: 0
				},
				{
					title: "Videos awaiting approval",
					data: 0
				},
				{
					title: "Transcriptions awaiting approval",
					data: 0
				},
				{
					title: "Some title here",
					data: "Data"
				},
				{
					title: "Some title here",
					data: "Data"
				},
				{
					title: "Some title here",
					data: "Data"
				}
			]
		}
		async.parallel([
			function(callback) { // Total views
				callback(null, '12,428')
			}, 
			function(callback) { // Videos awaiting approval
				sequelize.query('SELECT * FROM Episodes WHERE approved = 0').success(function(query) {
					var grammar = query.length === 1 ?
								  'Video awaiting approval' :
								  'Videos awaiting approval'
					callback(null, [grammar, query.length])
				})
			},
			function(callback) {
				callback(null, 15)
			}
		],
		function(err, callback) {
			for (var i in callback) {
				if (typeof(callback[i]) === 'object') { // Grammar easter egg
					data['boxes'][i].title = callback[i][0]
					data['boxes'][i].data = callback[i][1]
				} else {
					data['boxes'][i].data = callback[i]
					if (i == callback.length - 1) res.render('admin/admin', data)				
				}
			}
		})
}


module.exports.getEpisodes = function(req, res) {
	sequelize.query('SELECT * FROM Episodes WHERE approved = 1').success(function(query) {
			if (query.length > 0) {
				var data = {
					videos: []
				};
				data['videos'] = query;
				for (var i=0;i<data['videos'].length;i++) {
					var element = data['videos'][i]
					var eId = element.id
					sequelize.query('SELECT * FROM Shownotes WHERE EpisodeId = ? LIMIT 1', null, {raw: true}, [eId]).success(function(shownotes) {
						shownotes[0].content = shownotes[0].content.toString()
						shownotes[0].shortened = shownotes[0].content.replace(/(([^\s]+\s\s*){30})(.*)/,"$1…")
						if (shownotes) {
							element.shownotes = shownotes
						} else {
							element.shownotes = null
						}
						console.log(element)
						res.render('admin/admin-episodes', data)
					})
				}
			} else {
				res.render('admin/admin-episodes')
			}
		})
}

module.exports.getPendingEpisodes = function(req, res) {
	sequelize.query('SELECT * FROM Episodes WHERE approved = 0').success(function(query) {
		if (query.length > 0) {
			var data = {
				videos: []
			}
			data['videos'] = query;
			for (var i=0;i<data['videos'].length;i++) {
				var element = data['videos'][i]
				var eId = element.id
				console.log(eId);
				sequelize.query('SELECT * FROM Shownotes WHERE EpisodeId = ? LIMIT 1', null, {raw: true}, [eId]).success(function(shownotes) {
					if (shownotes.length > 0) {
						element.shownotes = shownotes
						shownotes[0].content = shownotes[0].content.toString()
					shownotes[0].shortened = shownotes[0].content.replace(/(([^\s]+\s\s*){30})(.*)/,"$1…")
					} else {
						element.shownotes = null
					}
					console.log(element)
				})
			}
			res.render('admin/admin-episodes-pending', data)
		} else {
			res.render('admin/admin-episodes-pending')
		}
	})
}

module.exports.getEpisodeById = function(req, res) {
	var data = {
		title: "Joe Learns to Code",
		thumbnail: "http://cdn.panasonic.com/images/imageNotFound400.jpg",
		video: null,
		author: "Joe Torraca",
		shownotes: "Lorem Ipsum",
		tags: [
			"Node.js",
			"Language",
			"MySQL",
			"Database"
		],
		status: {
			approval: "unapproved"
		},
		transcriptions: [
			{
				language: "English",
				status: "Active",
				showApproval: false
			},
			{
				language: "Spanish",
				status: "Active",
				showApproval: false
			},
			{
				language: "German",
				status: "Not active",
				showApproval: true
			}
		]
	}
	async.parallel([
		function (callback) {
			sequelize.query('SELECT title, ytURL, approved, UserId').success(function(data) {
				callback(null, data)
			})
		}
	], function callback(err, results) {
		res.render('admin/admin-episodes-specific', data)
	})
	console.log(data)
}

module.exports.getUsers = function(req, res) {
	sequelize.query('SELECT * FROM Users').success(function(query) {
		res.render('admin/admin-users', {
			users: query
		})
	})
}

module.exports.getUserById = function(req, res) {
	res.render('admin/admin')
}

module.exports.approveScreencast = function(req, res) {
	if (req.xhr) {
		sequelize.query('UPDATE Episodes SET approved = 1 WHERE id = :id', null, {raw: true}, {id: req.body.id}).success(function(approved) {
			var successJson = {
				status: 'ok',
				rowsModified: 1
			}
			res.write(JSON.stringify(successJson))
			res.end()
		}).error(function(error) {
			var errorJson = {
				status: 'error',
				rowsModified: null
			}
			res.write(errorJson)
			res.end()
		})
	}
}

module.exports.removeScreencast = function(req, res) {
	if (req.xhr) {

	}
}

module.exports.addTag = function(req, res) {
	if (req.xhr) {

	}
}

module.exports.changeUserRole = function(req, res) {
	if (req.xhr) {

	}
}

module.exports.addUser = function(req, res) {
	if (req.xhr) {
		sequelize.query('INSERT INTO Users (name, role, twitter_username, twitter_access_token, twitter_access_secret) VALUES (:name, :role, :twitter_username, :twitter_access_token, :twitter_access_secret)', null, {raw: true}, {name: res.body.name, role: res.body.role, twitter_username: res.body.twHandle, twitter_access_token: res.body.twAccessToken, twitter_access_secret: res.body.twAccessSecret}).success(function(user) {
			var json = {
				status:'ok',
				rowsModified:1
			}
			res.write(JSON.stringify(json))
			res.end()
		}).error(function(error) {
			var errorJson = {
				status:'error',
				rowsModified:null,
				error: error
			}
			res.write(JSON.stringify(errorJson))
			res.end()
		})
	}
}

module.exports.changeRole = function(req, res) {
	if (req.xhr) {

	}
}

module.exports.deactivateUser = function(req, res) {
	if (req.xhr) {
		var roles = {
			"admin": 1,
			"screencaster": 2,
			"moderator": 3,
			"viewer":4
		}
		sequelize.query('UPDATE Users SET active = 0 WHERE id = :id AND role = :role', null, {raw: true}, {id: req.body.id, role: roles[req.body.role]}).success(function(deleted) {
			var successJson = {
				status: 'ok',
				rowsModified: 1,
				recordRemoved: req.body.twHandle
			}
			res.write(JSON.stringify(successJson))
			res.end()
		}).error(function(error) {
			var errorJson = {
				status: 'error',
				rowsModified: null,
				error: 'sequelize'
			}
			res.write(JSON.stringify(errorJson))
			res.end()
		})
	}
}

module.exports.activateUser = function(req, res) {
	if (req.xhr) {
		var roles = {
			"admin": 1,
			"screencaster": 2,
			"moderator": 3,
			"viewer":4
		}
		sequelize.query('UPDATE Users SET active = 1 WHERE id = :id AND role = :role', null, {raw: true}, {id: req.body.id, role: roles[req.body.role]}).success(function(deleted) {
			var successJson = {
				status: 'ok',
				rowsModified: 1,
				recordRemoved: req.body.twHandle
			}
			res.write(JSON.stringify(successJson))
			res.end()
		}).error(function(error) {
			var errorJson = {
				status: 'error',
				rowsModified: null,
				error: 'sequelize'
			}
			res.write(JSON.stringify(errorJson))
			res.end()
		})
	}
}

module.exports.changeRole = function(req, res) {
	if (req.xhr) {
		var roles = {
			"admin": 1,
			"screencaster": 2,
			"moderator": 3,
			"viewer":4
		}
		sequelize.query('Update Users SET role = :role WHERE id = :id', null, {raw: true}, {role: roles[req.body.role], id:req.body.id}).success(function(data) {
			var successJson = {
				status: 'ok',
				rowsModified: 1
			}
			res.write(JSON.stringify(successJson))
			res.end()
		}).error(function(error) {
			var errorJson = {
				status: 'error',
				rowsModified: null,
				error: 'sequelize'
			}
			res.write(JSON.stringify(errorJson))
			res.end()
		})
	}
}

function requireViewer(req, res, next) {
	if (req.user && req.user.role === 4) {
		next()
	} else {
		res.redirect('/')
	}
}

function requireModerator(req, res, next) {
	if (req.user && (req.user.role === 3 || req.user.role === 1)) {
		next()
	} else {
		res.redirect('/')
	}
}

function requireScreencaster(req, res, next) {
	if (req.user && (req.user.role === 2 || req.user.role === 1)) {
		next()
	} else {
		res.redirect('/')
	}
}

function requireAdmin(req, res, next) {
	if (req.user && req.user.role === 1) {
		next()
	} else {
		res.redirect('/')
	}
}
