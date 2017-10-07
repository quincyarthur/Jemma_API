//import modules
require('dotenv').config();
const express = require('express');
const app = express();
const router = express.Router();
const cors = require('cors');
const parser = require('body-parser');
const morgan = require('morgan')

//import services
const passport = require('./app/services/passport')();
const kue = require('kue');

//import routes
const user_routes = require('./app/routes/user');
const auth_routes = require('./app/routes/auth');
const group_routes = require('./app/routes/group');
const page_routes = require('./app/routes/page');

//import models
const models = require('./app/models/db');

//initialize port
const PORT = process.env.PORT || 3000;

app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));
app.use(cors());
app.use(passport.initialize());
app.use(morgan('dev'));
app.use('/kue-ui', kue.app);
app.use('/api/v1',router);
router.use('/user',user_routes);
router.use('/auth',auth_routes);
router.use('/group',group_routes);
router.use('/page',page_routes);

//add catch all route to clean up any rogue requests
app.all('*',(req,res)=>{
    res.json({message:'404 route not found'});
});

models.sequelize.sync().then(function() {
  app.listen(PORT,()=>{
      console.log('Server listening on port 3000');
  });
  //app.on('error', onError);
  //app.on('listening', onListening);
});

module.exports = app;