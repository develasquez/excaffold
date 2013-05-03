#!/usr/bin/env node


//Imports
var fs = require('fs');
var mysql      = require('mysql');
var sys = require('sys')
var os = require('os')
var eol = os.EOL;


l = function (text){
	console.log(text)
};








/*
var exec = require('child_process').exec;
function puts(error, stdout, stderr) { sys.puts(stdout) }
exec("ls -la", puts);
*/

// Variables

var _str_project_name = process.argv[1].split("/")[process.argv[1].split("/").length -2];
//l(_str_project_name);
var _str_JSON_Object= "";
var _str_SQL_Query="";
var _int_columns_count= process.argv.length -2
var _obj_SQL_Config = { 
						host:'localhost',
						user:'root',
						secret:'devenew1',
						database: _str_project_name
					   };
//l(_obj_SQL_Config);
var _obj_Route = [	 'exports.list = function(req, res){'
					,'\tres.render(\'__route\', { title: \'__tile\' });'
					,'};'
					,'exports.delete = function(req, res){'
					,'\tres.render(\'__route\', { title: \'__tile\' });'
					,'};'
					,'exports.update = function(req, res){'
					,'\tres.render(\'__route\', { title: \'__tile\' });'
					,'};'
					,'exports.range = function(req, res){'
					,'\tres.render(\'__route\', { title: \'__tile\' });'
					,'};'
					,'exports.get = function(req, res){'
					,'\tres.render(\'__route\', { title: \'__tile\' });'
					,'};'
					].join(eol);;
//l(_obj_Route);

var _str_Jade = [
	  'extends layout'
	, ''
	, 'block content'
	, '  h1= title'
	, '  table#tRows'
	, '    tr'
	, '      td(colspan=' + _int_columns_count + ')#tTitle #{title}'
	, '    tr'
	, ''
].join(eol);




//l(_str_Jade);

var _str_regEx = [
	''
	, '//app.param(\'id\', /^\\d+$/);'
	,'//app.param(\'range\', /^(\\w+)\\.\\.(\\w+)?$/);'
].join(eol);
//l(_str_regEx);


var _str_app_list = [
   '/*' 
  ,'Scaffold generated routes'
  ,'*/'
  , 'var ' + process.argv[2] + '= require(\'./routes/'+ process.argv[2] + '\');'
  , 'app.get(\'/' + process.argv[2] +'\', ' + process.argv[2] + '.list);'
  , 'app.get(\'/' + process.argv[2] +'/:id/delete\', ' + process.argv[2] + '.delete);'
  , 'app.get(\'/' + process.argv[2] +'/:id/update\', ' + process.argv[2] + '.update);'
  , 'app.get(\'/' + process.argv[2] +'/:id/range\', ' + process.argv[2] + '.range);'
  , 'app.get(\'/' + process.argv[2] +'/:id\', ' + process.argv[2] + '.get);'
  , ''
  , ''
].join(eol);
//l(_str_app_list);

fs.readFile('sql.json', function (err, data) {
  if (err){
  	fs.writeFile('sql.json', JSON.stringify(_obj_SQL_Config)+'\n');
  	console.log('See the "sql.json" file');
  }else{
  	_obj_SQL_Config = JSON.parse(data);
  }
  
});

var connection = mysql.createConnection({
  host     : _obj_SQL_Config.host,
  user     : _obj_SQL_Config.user,
  password : _obj_SQL_Config.secret
});

_str_JSON_Object = '//Model Name ' + process.argv[2] + '.json\n';
_str_SQL_Query 	 = 'CREATE TABLE IF NOT EXISTS ' + _obj_SQL_Config.database + '.' + process.argv[2] + ' ( _id INT , '; 
_str_JSON_Object =  _str_JSON_Object + '\n';
_str_JSON_Object =  _str_JSON_Object + '{\n';

process.argv.forEach(function (val, index, array) {

	if(index > 2){

	var _str_name = val.split(":")[0];
	var _str_type = val.split(":")[1];
	_str_Jade+= '      td ' + _str_name + '\n';
	l(_str_Jade);
	_str_JSON_Object =  _str_JSON_Object + '\t"' + _str_name + '":"' + _str_type + '"' ;
	_str_SQL_Query = _str_SQL_Query + _str_name + ' ' + _str_type.replace('text','VARCHAR(50)')
	if ( index < process.argv.length - 1 )
	{
		_str_JSON_Object = _str_JSON_Object + ',\n';
		_str_SQL_Query = _str_SQL_Query + ',';
	}}
});


var _str_Jade_form = [
					''
					,'  form#frm_#{title}(action ="POST" )'


]


_str_JSON_Object =  _str_JSON_Object + '\n}\n';
_str_SQL_Query = _str_SQL_Query + ' CHARACTER SET utf8 COLLATE utf8_bin)';
_str_JSON_Object =  _str_JSON_Object + '//sql_query: ' + _str_SQL_Query ;

fs.mkdir('models',function (arg) {
	//create Model
	fs.writeFile('models/'+process.argv[2] + '.json', _str_JSON_Object);
	//create Table
	connection.query(_str_SQL_Query, function(err, rows, fields) {
        	if (err){	
            	if(err.code = "ER_BAD_DB_ERROR"){
            		console.log("the DB '" + _obj_SQL_Config.database + "' doesn't exist, I will create it...");
            			connection.query("CREATE DATABASE " + _obj_SQL_Config.database , function(err, rows, fields) {
            				connection.query(_str_SQL_Query, function(err, rows, fields) {
            					createFiles(); 
            				})
            			})
            	}else{
            		console.log(JSON.stringify(err))
            	}
        	}else{
            	createFiles(); 
        	}  
        })
})

function createFiles () {

	fs.mkdir('routes',function (arg) {
		fs.writeFile('routes/'+process.argv[2] + '.js', _obj_Route.replace(/__route/g,process.argv[2])
																  .replace(/__tile/g,process.argv[2]), function(){
			fs.mkdir('views',function (arg) {
					fs.writeFile('views/'+process.argv[2] + '.jade', _str_Jade, function(){
						fs.readFile('app.js', function (err, data) {
							data = 	data.toString()
									   	.replace(_str_regEx,'')
									   	.replace(_str_app_list.toString(),'')
										.replace("http.createServer(app)",_str_app_list +"http.createServer(app)")
										.replace("var app = express();",'var app = express();' + _str_regEx);

						  	fs.writeFile('app.js', data, function () {
						  		console.log('See the "app.js" file'); 
						  		console.log('Now run > node app.js ');
						  		process.exit(code=0)
						  	});
						});
					});
				})
		});
})
}











