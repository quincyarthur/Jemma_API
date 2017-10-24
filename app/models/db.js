require('dotenv').config();
const Sequelize = require('sequelize'); 

if (process.env.NODE_ENV === 'production'){
    var sequelize = new Sequelize(process.env.DATABASE_URL,{dialect:'postgres',define:{underscored:true}});
}
else{
    var sequelize = 
    new Sequelize(process.env.DATABASE_NAME, 
                  process.env.DATABASE_USERNAME, 
                  process.env.DATABASE_PASSWORD,
                  {  
                    host: process.env.DATABASE_HOST,
                    port: process.env.DATABASE_PORT,
                    dialect:process.env.DATABASE_DIALECT,
                    define: {
                        underscored: true
                    }
    });
}

// Connect all the models/tables in the database to a db object, 
//so everything is accessible via one object
const db = {};

db.Sequelize = Sequelize;  
db.sequelize = sequelize;

//Models/tables
db.account_page = require('./account_page')(sequelize, Sequelize);
db.account_type = require('./account_type')(sequelize, Sequelize);
db.group = require('./group')(sequelize, Sequelize);
db.mention_tone = require('./mention_tone')(sequelize, Sequelize);
db.keyword_sentiment = require('./keyword_sentiment')(sequelize, Sequelize);
db.page_tone = require('./page_tone')(sequelize, Sequelize);
db.plan = require('./plan')(sequelize, Sequelize);
db.post_tone = require('./post_tone')(sequelize, Sequelize);
db.post_sentiment = require('./post_sentiment')(sequelize, Sequelize);
db.post_demographic = require('./post_demographic')(sequelize, Sequelize);
db.preference = require('./preference')(sequelize, Sequelize);
db.preference_type = require('./preference_type')(sequelize, Sequelize); 
db.preference_value = require('./preference_value')(sequelize, Sequelize);
db.purchase_history = require('./purchase_history')(sequelize, Sequelize);
db.subscription = require('./subscription')(sequelize, Sequelize);
db.tone = require('./tone')(sequelize, Sequelize);   
db.page = require('./page')(sequelize, Sequelize);
db.user_account = require('./user_account')(sequelize, Sequelize);
db.user = require('./user')(sequelize, Sequelize);


//Relations
db.user.hasMany(db.user_account,{foreignKey: 'user_id' });
//db.user_account.belongsTo(db.user,{foreignKey: 'id'});
//db.account_type.hasMany(db.user_account,{foreignKey: 'account_type_id' });
//db.user_account.belongsTo(db.account_type,{foreignKey: 'account_type_id' });
/***** Pre Facebook Set Up (Flaw: Only allowed one Account Type per user)
db.user.belongsToMany(db.account_type, {through: db.user_account,foreignKey: 'user_id' })
db.account_type.belongsToMany(db.user, {through: db.user_account,foreignKey: 'account_type_id'})
*****/
db.user_account.hasMany(db.account_page,{foreignKey: 'user_account_id' });
db.account_type.hasMany(db.user_account,{foreignKey: 'account_type_id' });
//db.account_page.belongsTo(db.user_account);
//db.page.hasMany(db.account_page,{foreignKey: 'page_id' });
//db.account_page.belongsTo(db.page);
db.user_account.belongsToMany(db.page, {through: db.account_page,foreignKey: 'user_account_id' });
db.page.belongsToMany(db.user_account, {through: db.account_page,foreignKey: 'page_id'});
db.group.hasOne(db.page,{foreignKey: 'group_id' });
//db.page.belongsTo(db.group);
db.user.hasMany(db.preference,{foreignKey: 'user_id' });
//db.preference.belongsTo(db.user);
db.preference_type.hasMany(db.preference_value,{foreignKey: 'preference_type_id' });
//db.preference_value.belongsTo(db.preference_type);
db.user.belongsToMany(db.plan, {through: db.subscription,foreignKey: 'user_id' });
db.plan.belongsToMany(db.user, {through: db.subscription,foreignKey: 'plan_id'});
db.user.hasMany(db.purchase_history,{foreignKey: 'user_id' });
//db.purchase_history.belongsTo(db.user);
db.subscription.hasMany(db.purchase_history,{foreignKey: 'subscription_id' });
//db.purchase_history.belongsTo(db.subscription);
db.page.hasMany(db.page_tone,{foreignKey: 'page_id' });
//db.page_tone.belongsTo(db.page);
db.tone.hasMany(db.page_tone,{foreignKey: 'tone_id' });
//db.page_tone.belongsTo(db.tone);
db.page.hasMany(db.post_tone,{foreignKey: 'page_id' });
db.page.hasMany(db.post_sentiment,{foreignKey: 'page_id' });
db.page.hasMany(db.post_demographic,{foreignKey: 'page_id' });
//db.post_tone.belongsTo(db.page);
//db.tone.hasMany(db.post_tone,{foreignKey: 'tone_id' });
//db.post_tone.belongsTo(db.tone);
db.page.hasMany(db.keyword_sentiment,{foreignKey: 'page_id' });
db.page.hasMany(db.mention_tone,{foreignKey: 'page_id' });
//db.mention_tone.belongsTo(db.mention_tone);

module.exports = db;  