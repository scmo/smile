//app.js
var express = require('express')
//var fs = require('fs')
var http = require('http')
// var https = require('https')
var app = express()
var path = require('path');
const axios = require('axios')
var cloudinary = require('cloudinary')
const bodyParser = require('body-parser');
app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.urlencoded({limit: '5mb', extended: true}));


var config =  {}
var apiKey = {}
try {
	config = require('./config.js');

	apiKey = config.azure.key
	cloudinary.config({ 
		cloud_name: config.cloudinary.cloud_name, 
		api_key: config.cloudinary.api_key, 
		api_secret: config.cloudinary.api_secret 
	});
    // do stuff
} catch (ex) {
    apiKey = process.env.ENV_AZURE_APIKEY
	cloudinary.config({ 
		cloud_name: process.env.ENV_CLOUDINARY_CLOUDNAME, 
		api_key: process.env.ENV_CLOUDINARY_APIKEY, 
		api_secret: process.env.ENV_CLOUDINARY_APISECRET
	});
}



const baseURL = 'https://westcentralus.api.cognitive.microsoft.com'
const personGroupId = 'smile-members'
var persons = []
persons['4aebfdb6-df12-4b9c-8689-b632b47f2fe9'] = {
	name: 'Joel'
}
persons['67203687-01b7-4304-8b0a-3e30d74a9560'] = {
	name: 'Yumi'
}
persons['1533782b-4d8d-41fa-bb96-9d25215ee672'] = {
	name: 'Moritz'
}


app.use(express.static("static/public"));

var port = process.env.PORT || 3000;
// var server = https.createServer({
//   // key: fs.readFileSync('server.key'),
//   // cert: fs.readFileSync('server.cert')
// }, app)
// .listen(3000, function () {
//   console.log('Example app listening on port 3000! Go to https://localhost:3000/')
//   //trainPersonGroup()
//   // /getPersonGroup()
// })
app.listen(port, function () {
  console.log('Example app listening on port 3000! Go to http://localhost:3000/')
  //trainPersonGroup()
  // /getPersonGroup()
})
var io = require('socket.io')

// Routes
app.get('/', function (req, res) {
	console.log(__dirname)
	res.sendFile(path.join(__dirname + '/index.html'));
   	//res.send('Hello Worffld!')
})

app.get('/socket.io', function (req, res) {
})


app.post('/faceimage', function (req, res) {
	uploadBlob(req.body.imgBase64);
	res.sendStatus(200)
});

app.post('/confirmface', function(req,res) {
	const body = req.body.nr
	data = {recognized: false }
	if (body > 0) {
		data = {recognized: true }
		switch(body) {
			case 1:
				data.name = 'Yumi';
				break
			case 2:
				data.name = 'Joel';
				break
			case 3:
				data.name = 'Moritz';
				break
		}
	}
	
	io.emit('confirmFace', data)
  	res.send(`You sent: ${body} to Express`)
});

app.post('/confirmpurchase', function(req,res) {
	io.emit('confirmPurchase', '')
  	res.send(`You sent: confirmpurchase to Express`)
});


// io.on('connection', function(socket){
//   console.log('a user connected');
//    //socket.broadcast.emit('hi');
//     //socket.emit('notify', 'adsfadsf');
// });

function trainPersonGroup() {
	url = baseURL + '/face/v1.0/persongroups/'+ personGroupId +'/train'

	const params = {
    	headers: {
    		'Content-Type':'application/json',
            'Ocp-Apim-Subscription-Key': apiKey,
    	}
    }
	axios.post(url, {}, params)
	.then(function (response) {
		//console.log(response);
		console.log('Training complete')
	})
	.catch(function (error) {
		console.log(error);
		console.error('error')
	});
}




function getPersonGroup() {
	url = baseURL + '/face/v1.0/persongroups/' + personGroupId
	
	const params = {
    	headers: {
    		'Content-Type':'application/json',
            'Ocp-Apim-Subscription-Key': apiKey,
    	}
    }

	axios.get(url, params)
	.then(function (response) {
		//console.log(response);
		console.log( 'Group name: ' + response.data.name)
		getPersonsFromPersonGroup(personGroupId)
	})
	.catch(function (error) {
		//console.log(error);
		console.error('error')
	});
}

function getPersonsFromPersonGroup(personGroupId) {
	url = baseURL + '/face/v1.0/persongroups/' + personGroupId + '/persons'

	const params = {
    	headers: {
    		'Content-Type':'application/json',
            'Ocp-Apim-Subscription-Key': apiKey,
    	}
    }

	axios.get(url, params)
	.then(function (response) {
		//console.log(response);
		console.log('Members:')
		response.data.forEach(function(person) {
			console.log(person)
		})

		//console.log( 'Group name: ' + response.data.name)
	})
	.catch(function (error) {
		//console.log(error);
		console.error('error')
	});
}
 
function detectFace(faceURL) {	
	url = baseURL + '/face/v1.0/detect?returnFaceId=true'
	const data = {
    	url: faceURL
    }

	const params = {
    	headers: {
    		'Content-Type':'application/json',
            'Ocp-Apim-Subscription-Key': apiKey,
    	}
    }

	axios.post(url, data, params)
	.then(function (response) {
		//console.log(response);
		//console.log(response.data[0].faceId)
		identifyFace(response.data)
	})
	.catch(function (error) {
		//console.log(error);
		console.error('error detecting')
	});
}

function identifyFace(faces) {
	url = baseURL + '/face/v1.0/identify'
	
	const data = {
		faceIds: faces.map(face => face.faceId),
    	personGroupId: personGroupId
    }
	const params = {
    	headers: {
    		'Content-Type':'application/json',
            'Ocp-Apim-Subscription-Key': apiKey,
    	}
    }
	axios.post(url, data, params)
	.then(function (response) {
		//console.log(response);
		console.log('========================')
		response.data.forEach(function(face) {
			console.log('Face: ' + face.faceId)
			console.log('Candidates')
			face.candidates.forEach(function(candidate) {
				//console.log(candidate)
				console.log(persons[candidate.personId].name + ' - Confidence: ' + candidate.confidence)
				if(candidate.confidence > 0.6) {
					res = {recognized: true, name: persons[candidate.personId].name}
					io.emit('confirmFace', res)
				}
			})	
		})

	})
	.catch(function (error) {
		console.log(error);
		console.error('error identifyFace')
	});
}


function uploadBlob(imgData) {
	cloudinary.v2.uploader.upload(imgData, 
    function(error, result) {
    	//console.log(result); 
    	console.log(result.secure_url)
    	detectFace(result.secure_url)
    });
}