var express = require('express')
var router = express.Router()
var Image = require('./imageModel')
var bodyParser = require('body-parser')
var jwt = require('jsonwebtoken')
var request = require('request')

//image storage


router.use(bodyParser.urlencoded({extended:true}))
router.use(bodyParser.json())


const verifyToken = (req,res,next) => {
    var tokenHeader = req.get('Authorization')
    if(typeof tokenHeader !== 'undefined'){
        var tokenPart = tokenHeader.split(' ')
        req.token = tokenPart[1]
        next()
    }else{
        res.status(403).send({message : "split token error "+ req.token})
    }
}

router.post('/login',(req,res) => {

    if(Object.keys(req.body).length === 0){
        res.status(400).json({
            message : "Credentials required!"
        })
    }

    Image.findOne(req.body,'name email')
    .then(data => {
        if(!data){
            return res.status(404).json({
                message : "No user found with this credentials"
            })
        }
        jwt.sign({data},'secretKey',(err, token)=>{
            if(err){
                return res.send({message : "token error "+err.message })
            }
            res.send(token)
        })
    })
    .catch(err => res.status(500).json({ message : "Unable to find user "+ err.message}))

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
        url: 'https://yapihew.atlassian.net/wiki/rest/api/content',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic eWFwaWhldzY3NUBtYWlsZmlsZS5vcmc6ZDA5Y0hIeEhCMVdlbWM2RzVLemVBNUUw'
        }
    }
    request(options,function(error,response,body){

        if (error) {
            throw new Error(error);
             res.json({
                 message :"erroor : ",error
             })
        }
        console.log(
         'Response: ' + response.statusCode + ' ' + response.statusMessage
      );
        console.log(body);
        res.json({
         message: "successfully",
         data: JSON.parse(body)
        });
     
 })
    
    })

//getting page template
router.get('/ok',(req,res)=>{

    var options = {
       method: 'GET',
       url: 'https://yapihew.atlassian.net/wiki/rest/api/template/7733501',
       headers: {
           'Content-Type': 'application/json',
           'Authorization': 'Basic eWFwaWhldzY3NUBtYWlsZmlsZS5vcmc6ZDA5Y0hIeEhCMVdlbWM2RzVLemVBNUUw'
       }
   }

    request(options,function(error,response,body){

           if (error) {
               throw new Error(error);
                res.json({
                    message :"erroor : ",error
                })
           }
           console.log(
            'Response: ' + response.statusCode + ' ' + response.statusMessage
         );
         var a =JSON.parse(body)
           //console.log(a," O K ");
           res.json(JSON.stringify(a.body.storage.value));
           console.log(JSON.stringify(a.body.storage.value))
        
    })
   
})

//simply creating page from bodyData
router.post('/confluence/:title/:content',(req,res)=>{

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
        url: 'https://yapihew.atlassian.net/wiki/rest/api/content',
        headers: {
           'Content-Type': 'application/json',
           'Authorization': 'Basic eWFwaWhldzY3NUBtYWlsZmlsZS5vcmc6ZDA5Y0hIeEhCMVdlbWM2RzVLemVBNUUw'
        },
        body: bodyData
     };
     
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
router.post('/createPage/:title',(req,res)=>{

    //getting template with id
    var options = {
        method: 'GET',
        url: 'https://yapihew.atlassian.net/wiki/rest/api/template/7733501',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic eWFwaWhldzY3NUBtYWlsZmlsZS5vcmc6ZDA5Y0hIeEhCMVdlbWM2RzVLemVBNUUw'
        }
    }
 
     request(options,function(error,response,body){
 
            if (error) {
               // throw new Error(error);
                 res.json({
                     message :"erroor : ",error
                 })
            }
           
           // console.log(body);

            const templateData = JSON.parse(body); //to access inside object
    var temp = JSON.stringify(templateData.body.storage.value);


            //template body;
          //  console.log("tempData : ",templateData," tmapdlfjbshfbhjddddd")
            var bodyData = `{
                "id":"8093825",
                "title":"${req.params.title}",
                "type":"page",
                "space":{"key":"PROPAGE"},
                "status":"current","ancestors":[],
                "body":{
                    "storage":{
                        "_expandable":{
                            "content":"/rest/api/content/8093825"
                        },
                        "representation":"storage",
                        "value": ${temp}
                    }
                }
            }`;
            function myFunction(str) {
                var n = str.search("JP");
                return n;
                //document.getElementById("demo").innerHTML = n;
              }
          // console.log(templateData, " raavan")
            res.json(myFunction(temp))
           
            //create page with template body
            // var options1 = {
            //     method: 'POST',
            //     url: 'https://yapihew.atlassian.net/wiki/rest/api/content',
            //     headers: {
            //        'Content-Type': 'application/json',
            //        'Authorization': 'Basic eWFwaWhldzY3NUBtYWlsZmlsZS5vcmc6ZDA5Y0hIeEhCMVdlbWM2RzVLemVBNUUw'
            //     },
            //     body: bodyData
            //  };
             
            //  request(options1, function (error, response, body) {
            //     //if (error) throw new Error(error);
            //     if (error) {
            //        // throw new Error(error);
            //         res.json({
            //              message :"erroor : ",error
            //          });
            //     }
            //     console.log(
            //        'Response: ' + response.statusCode + ' ' + response.statusMessage
            //     );
            //     console.log(body);
            //     res.send(body)
            //  });
     });   
})

module.exports = router