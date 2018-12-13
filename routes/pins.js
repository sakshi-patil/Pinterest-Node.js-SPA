var path = require('path');
var Pin = require('../models/pin');




module.exports = function(app){

  app.get('/pins/pin-search',function(req,res,next){
     Pin.find({"title" : {"$regex": req.query['search'], "$options": "1"}},function(err,pins){
       res.render('pins/index',{pins: pins});
     })
   })

  app.get('/pins/saved-pins',function(req,res,next){
      Pin.find({"isSave" : true},function(err,pins){
        res.render('pins/index',{pins: pins});
      })
    })

  app.get('/pins/pin-save/:id',function(req,res,next){
    Pin.findOne({_id: req.params.id},function(err,foundPin){
      if(foundPin){
        foundPin.isSave = !(foundPin.isSave);

        foundPin.save(function(err){
          if(err) return next(err);
          res.json(foundPin.isSave);
          //res.redirect('/pins/details/'+foundPin._id);
        })
      }
    })
  })


  app.route('/pins/create')
    .get(function(req,res,next){
      res.render('pins/create');
    })
    .post(function(req,res,next){
      console.log('post');
      var pin = new Pin();
      pin.title = req.body.title;
      pin.desc = req.body.desc;
      pin.username = req.body.username;
      pin.isSave = false;

      if(!req.files)
        return json('error');

      let sampleFile = req.files.sampleFile;
      let fileName = Math.random().toString(26).slice(2) + '.jpg';
      let path = './public/Files/' + fileName;
      pin.path = '/Files/' + fileName;

      sampleFile.mv(path, function(err){
        if(err)
          return res.status(500).send(err);
      })

        pin.save(function(err){
          if(err) throw err;
          res.redirect('/pins/index');
        })

    })

    app.route('/pins/edit/:id')
      .get(function(req,res,next){
        Pin.findOne({_id: req.params.id},function(err,foundPin){
          res.render('pins/edit',{pin: foundPin});
        })
      })
      .post(function(req,res,next){
      Pin.findOne({_id: req.params.id},function(err,foundPin){

        if(foundPin){
          if(req.body.title) foundPin.title = req.body.title;
          if(req.body.desc) foundPin.desc = req.body.desc;

          foundPin.save(function(err){
            if(err) return next(err);
            res.redirect('/pins/details/'+ foundPin._id);
          })
        }


      })
    })

    app.get('/pins/index', function(req,res,next){
      Pin.find({},function(err, pins){
        res.render('pins/index', {pins: pins});
      })
    })

    app.get('/pins/details/:id', function(req,res,next){
      Pin.findOne({_id: req.params.id})
        .exec(function(err, foundPin){
          res.render('pins/details',{pin: foundPin});
        })
    })

    app.get('/pins/delete/:id', function(req,res,next){
      Pin.find({_id: req.params.id}).remove()
        .exec(function(err, foundPin){
          //res.json(true);
          res.redirect('/pins/index');
        })
    })



}
