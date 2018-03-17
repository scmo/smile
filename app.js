//app.js
var express = require('express')
var app = express()
const https = require('https');
const axios = require('axios')

const apiKey = 'xxxxx'
const personGroupId = 'smile-members'

app.get('/', function (req, res) {
   res.send('Hello Worffld!')
})

app.listen(3000, function () {
   console.log('Example app listening on port 3000!')
   //trainRecognizer()
   //detectFaces()
   getPersonGroup()
})





function addFacesToFacelist() {
	j1 = 'https://media-exp2.licdn.com/mpr/mpr/shrinknp_200_200/p/4/005/0ad/3c6/3ccc153.jpg'
	j2 = 'http://www.joelsonderegger.com/profile.jpg'
	j3 = 'https://pbs.twimg.com/profile_images/870023307512483840/vs8JHU8q_400x400.jpg'
	j4 = 'https://cdn-images-1.medium.com/max/1200/0*jNoeOCqcozMl0AA5.jpeg'

	y1 = 'https://www.xing.com/image/d_c_0_08c497ae4_20324917_2/yumi-bae-foto.1024x1024.jpg'
	y2 = 'https://scontent-sea1-1.cdninstagram.com/vp/cf96c6433777bf38293e20fa0e62d991/5B2D9879/t51.2885-15/s480x480/e35/c0.135.1080.1080/27878329_190924438325711_3923330750904008704_n.jpg?ig_cache_key=MTcxMDkzMDI5MjMyNTI1MjE0Ng%3D%3D.2.c'


}
/*
Joel
{
  "personId": "4aebfdb6-df12-4b9c-8689-b632b47f2fe9"
}
Yumi
{
  "personId": "67203687-01b7-4304-8b0a-3e30d74a9560"
}
Moritz
{
  "personId": "1533782b-4d8d-41fa-bb96-9d25215ee672"
}
*/


function getPersonGroup() {
	url = 'https://westcentralus.api.cognitive.microsoft.com/face/v1.0/persongroups/' + personGroupId
	
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
	url = 'https://westcentralus.api.cognitive.microsoft.com/face/v1.0/persongroups/' + personGroupId + '/persons'

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
 



 
