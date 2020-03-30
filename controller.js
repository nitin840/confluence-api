var express = require('express')
var router = express.Router()
var bodyParser = require('body-parser')
var jwt = require('jsonwebtoken')
var request = require('request')
const postURL = 'https://yapihew.atlassian.net'
const secretKey = Buffer.from('Hello World!','utf8').toString('base64')

router.use(bodyParser.urlencoded({extended:true}))
router.use(bodyParser.json())


const verifyToken = (req, res, next) => {
    var tokenHeader = req.headers.authorization;
  
    if (!tokenHeader || typeof tokenHeader === "undefined") {
      res.send({
        auth: false,
        message: "NO token provided "
      });
      console.log("R::");
    } else {
      token = tokenHeader.split("Bearer ")[1];
      jwt.verify(token, secretKey, (err, payLoad) => {
        if (err) {
          return res.status(500).send({
            auth: false,
            message: "token verify error " + err.message
          });
        }
        next();
        return true; //req.decode = payLoad
      });
    }
  };
// token to client 
router.post('/auth',(req,res) => {

    if(Object.keys(req.body).length === 0){
        res.status(400).json({
            message : "Email & Password required!"
        })
    }

    jwt.sign(req.body,secretKey,(err, token)=>{
        if(err){ return res.send({message : "token error "+err.message }) }
        res.json({
            token:token
        })    
    })
})

//jeets api
router.get('/fetch',(req,res)=>{
    axios.get('https://confluence-cab62.firebaseio.com/data.json')
    .then(data =>{
        if(!data){
            return res.status(404).json({
                message:"Not found!"
            })
        }
        res.status(200).json({
            message: "success",
            data:data.data,
        })
    })
    .catch(err=>{
        res.json({
            message: "Unable to fetch data "+err,
        })
        console.log(err.message)
    })
})

//getting page content
router.get('/atlassian',(req,res)=>{

    var options = {
      method: 'GET',
      url: postURL + '/wiki/rest/api/content',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic' + process.env.ATLASSIAN_TOKEN
      }
    }
    request(options,function(error,response,body){

        if (error) {
             res.json({
                 error
             })
        }
        console.log('Response: ' + response.statusCode + ' ' + response.statusMessage)
        res.json({
          message: "successfully",
          data: JSON.parse(body)
        });
     
    })
    
})

//getting page template
router.get('/ok',verifyToken,(req,res)=>{

    var options = {
        method: 'GET',
        url: postURL + '/wiki/rest/api/template/7733501',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic' + process.env.ATLASSIAN_TOKEN
        }
    }

    request(options,function(error,response,body){
        if (error) {
            // throw new Error(error);
              res.json({
                  message :"erroor : ",error
              })
        }
        console.log('Response: ' + response.statusCode + ' ' + response.statusMessage)
        var a =JSON.parse(body)
        res.json(JSON.stringify(a.body.storage.value));
    })
})

//simply creating page from bodyData
router.post('/createPage/:title/:content',(req,res)=>{

    const titlevalue = req.params.title;
    const bodyvalue = req.params.content;

    var bodyData = `{
        "id":"8093825",
        "title":"${titlevalue}",
        "type":"page",
        "space":{"key":"PROPAGE"},
        "status":"current","ancestors":[],
        "body":{
            "storage":{
                "_expandable":{
                    "content":"/rest/api/content/8093825"
                },
                "representation":"storage",
                "value": "${bodyvalue}"
            }
        }
    }`;

    //res.send(bodyData)
    var options = {
        method: 'POST',
        url: postURL + '/wiki/rest/api/content',
        headers: {
           'Content-Type': 'application/json',
           'Authorization': 'Basic' + process.env.ATLASSIAN_TOKEN
        },
        body: bodyData
     }
     
    request(options, function (error, response, body) {
      //if (error) throw new Error(error);
      if (error) {
          // throw new Error(error);
          res.json({
                message :"erroor : ",error
            });
      }
      console.log(
          'Response: ' + response.statusCode + ' ' + response.statusMessage
      );
      console.log(body);
      res.send(body)
    });
})

//get template and create page
router.get("/templatePage/:countryName/:countryCode", (req, res) => {
    var templateId = 7733501;
    //getting template with id
    var options = {
      method: "GET",
      url: "https://yapihew.atlassian.net/wiki/rest/api/template/" + templateId,
      headers: {
        "Content-Type": "application/json",
        Authorization: 'Basic' + process.env.ATLASSIAN_TOKEN
      }
    };
  
    request(options, (error, response, body) => {
      if (error) {
        res.json({
          error: error
        });
      }
  
      const templateData = JSON.parse(body); //to access inside object
      var temp = JSON.stringify(templateData.body.storage.value);
  
      var resbody = temp.replace(/uniquecountrycode/g, req.params.countryCode);
      resbody = resbody.replace(/uniquecountryname/g, req.params.countryName);
  
      //template body;
      var bodyData = `{
                  "id":"8093825",
                  "title":"${req.params.countryName}",
                  "type":"page",
                  "space":{"key":"PROPAGE"},
                  "status":"current","ancestors":[],
                  "body":{
                      "storage":{
                          "_expandable":{
                              "content":"/rest/api/content/8093825"
                          },
                          "representation":"storage",
                          "value": ${resbody}
                      }
                  }
              }`;
  
      //create page with template body
      var options1 = {
        method: "POST",
        url: "https://yapihew.atlassian.net/wiki/rest/api/content",
        headers: {
          "Content-Type": "application/json",
          Authorization: 'Basic' + process.env.ATLASSIAN_TOKEN
        },
        body: bodyData
      };
  
      request(options1, (error, response, body) => {
        if (error) {
          res.json({
            error: error
          });
        }
  
        res.send({
          statusCode: response.statusCode,
          statusMessage: response.statusMessage,
          data: JSON.parse(body)
        });
      });
    });
  });

module.exports = router