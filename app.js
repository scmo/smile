//app.js
var express = require('express')
var app = express()
var path = require('path');
const https = require('https');
const axios = require('axios')
var cloudinary = require('cloudinary')
const bodyParser = require('body-parser');
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

var config = require('./config.js');

cloudinary.config({ 
  cloud_name: config.cloudinary.cloud_name, 
  api_key: config.cloudinary.api_key, 
  api_secret: config.cloudinary.api_secret 
});

const baseURL = 'https://westcentralus.api.cognitive.microsoft.com'
const apiKey = config.azure.key 
const personGroupId = 'smile-members'

const persons = []
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
app.get('/', function (req, res) {
	console.log(__dirname)
	res.sendFile(path.join(__dirname + '/index.html'));
   	//res.send('Hello Worffld!')
})

app.post('/faceimage', function (req, res) {
	uploadBlob(req.body.imgBase64);
 });

app.listen(3000, function () {
   console.log('Example app listening on port 3000!')
   //trainPersonGroup()
  
   getPersonGroup()

   // Joel
   //detectFace('https://www.zuehlke.com/blog/app/uploads/2017/07/1411982043-bpfull.jpg')
   // Yumi
   //detectFace('https://scontent-sea1-1.cdninstagram.com/t51.2885-15/s480x480/e35/20590151_117770065541012_3514565557858861056_n.jpg?ig_cache_key=MTU3NDgyNDU5MDM5NTIwMDk3OQ%3D%3D.2')
 	//detectFace('https://res.cloudinary.com/smilehack/image/upload/v1521286978/i2s6j2ewfvupivazllyz.jpg');
})

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
	console.log(faces)
	
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
		
		response.data.forEach(function(face) {
			console.log('Face: ' + face.faceId)
			console.log('Candidates')
			face.candidates.forEach(function(candidate) {
				//console.log(candidate)
				console.log(persons[candidate.personId].name + ' - Confidence: ' + candidate.confidence)
			})	
		})

	})
	.catch(function (error) {
		// console.log(error);
		console.error('error')
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

 
