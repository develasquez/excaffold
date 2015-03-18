#!/usr/bin/env node


var program = require('commander');
var fs = require('fs');
var os = require('os');
var eol = os.EOL;
var fs = require('fs');
var metaMobile = "meta(name=\"viewport\", content=\"width=device-width, initial-scale=1\")";
var JqJs = "script(src=\"http://code.jquery.com/jquery.min.js\" ,type=\"text/javascript\")";
var bstwCss = "link(href=\"http://getbootstrap.com/dist/css/bootstrap.min.css\", rel=\"stylesheet\")";
var bstwJs = "script(src=\"http://getbootstrap.com/dist/js/bootstrap.min.js\" ,type=\"text/javascript\")";
var skioJs = "script(src=\"/javascripts/connection.js\" ,type=\"text/javascript\")";
var prompt = require('prompt');
var _str_project_name = '';
var engine = "";
var path = '.';

prompt.start();
program
        .version('0.0.103')
        .option('-e, --entity', 'Create only the entity, without the basic node.js function')
        .option('-p, --postgre', 'Postgre SQL db engine')
        .option('-y, --mysql', 'mysql db engine')
        .option('-l, --sqlite', 'Sqlite db engine')
        .option('-m, --mongo', 'mongodb db engine')
        .option('-o, --other', 'other db engine , need db_conection.js file http://github.com/develasquez/excaffold/other')
        .parse(process.argv);

console.log("Executing...");
console.log("Excaffold version : ", program.version());

var fullPrams = '-e,--entity,-p,--postgre,-y, --mysql, -m,-l, --sqlite, --mongo,-o, --other';
l = function(text) {
    console.log(text);
};
capitalise = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};
toMongoDataType = function(dataType) {
    switch (capitalise(dataType))
    {
        case 'Date' :
        case 'Datetime' :

            {
                mongoDataType = 'Date';
            }
            break;
        case 'Timestamp':
            {
                mongoDataType = '{ type: Date, default: Date.now }';
            }
            break;

        case 'String':
        case 'TinyText':
        case 'Text':
        case 'MediumText':
        case 'LongText':
            {
                mongoDataType = 'String';
            }
            break;
        case 'Number':
        case 'TinyInt':
        case'SmallInt':
        case'MediumInt':
        case'Integer':
        case'Int':
        case'BigInt':
        case'Numeric':
        case'Float':
        case'xReal':
        case'Double':
        case'Decimal':
        case'Dec':
            {
                mongoDataType = 'Number';
            }
            break;
        case 'Bit' :
        case 'Bool' :
        case 'Boolean':
            {
                mongoDataType = 'Boolean';
            }
            break;

    }

    return mongoDataType;
};

var pathName = process.argv[1].split("/")[process.argv[1].split("/").length - 2];
_str_project_name = pathName;

fs.readFile(path + '/sql.json', function(err, data) {
    if (!err) {
        var data = JSON.parse(data.toString());
        main(data.database, data.host, data.user, data.password, data.database);
    } else {
        prompt.get(['Project_Name'], function(err, result) {
            if (err) {
                return l(err);
            }
            console.log('Project Name : ' + result.Project_Name);
            _str_project_name = result.Project_Name;

            if (program.postgre || program.mysql) {
                console.log('Please introduce the DB credentials :');
                if (program.postgre) {
                    console.log("if you are using Postgre, need an existing db");
                    prompt.get(['host', 'user', 'password', 'db'], function(err, result) {
                        main(_str_project_name, result.host, result.user, result.password, result.db);
                    });
                }
                if (program.mysql) {
                    prompt.get(['host', 'user', 'password'], function(err, result) {
                        main(_str_project_name, result.host, result.user, result.password, null);
                    });
                }
            } else {
                //if mongo or sqlite
                main(result.Project_Name, null, null, null, null);
            }
        });
    }
});
function getConnection(engine, dbConf) {
    var DBWrapper = require('node-dbi').DBWrapper;
    var DBExpr = require('node-dbi').DBExpr;

    var dbConnectionConfig;
    if (engine == "pg") {
        dbConnectionConfig = dbConf;
    }
    if (engine == "mysql") {
        dbConnectionConfig = dbConf;
    }
    if (engine == "sqlite3") {
        dbConnectionConfig = {database: dbConf.database};
    }

    dbWrapper = new DBWrapper(engine, dbConnectionConfig);
    dbWrapper.connect();
    return dbWrapper
}
function main(project, host, user, password, db) {

    var mongo = null;
    if (!(program.mysql && program.postgre && program.sqlite)) {
        program.mongo = true;
    }

    var onlyEntity = false;
    if (program.entity)
        onlyEntity = true;
    if (program.postgre) {
        try {
            pg = require('pg');
            if (!pg) {
                console.log("Please execute: \n npm install -g pg");
                return false;
            }
        } catch (ex) {
            console.log("Please execute: \n npm install -g pg");
            return false;
        }
    }
    if (program.mysql) {
        try {
            mysql = require('mysql');
            if (!mysql) {
                console.log("Please execute: \n npm install -g mysql");
                return false;
            }
        } catch (ex) {
            console.log("Please execute: \n npm install -g mysql");
            return false;
        }
    }
    if (program.sqlite) {
        try {
            sqlite = require('sqlite3');
            if (!sqlite) {
                console.log("Please execute: \n npm install -g sqlite3");
                return false;
            }
        } catch (ex) {
            console.log("Please execute: \n npm install -g sqlite3");
            return false;
        }
    }
    var params = program.rawArgs;
    var _str_JSON_Object = "";
    var _str_SQL_Query = "";
    var _int_columns_count = process.argv.length - 2;
    var _obj_SQL_Config = {
        host: host || 'localhost',
        user: user || 'root',
        password: password || 'password',
        database: db || project
    };
    var _obj_mongo_file = [
        'var mongoose  = require(\'mongoose\');',
        'mongoose.connect(\'mongodb://127.0.0.1:27017/' + project + '\');',
        'collections = {};',
        'module.exports = {',
        '    ObjetId:function(string){',
        '        return mongoose.Types.ObjectId(string);',
        '    },',
        '   open:function (collection,schema,fun){',
        '        var Schema = mongoose.Schema;',
        '       var newSchema = new Schema(schema);',
        '       var listOfReferences = [];',
        '        for (prop in schema){ ',
        '            try{',
        '                var collectionRef = schema[prop][0].ref',
        '                listOfReferences[listOfReferences.length] = collectionRef;',
        '                var reference =  require(\'./models/_\' + collectionRef);',
        '                var schemaRef = new Schema(reference.getMongoObj());',
        '                if (!collections[collectionRef]){',
        '                    collections[collectionRef]=  mongoose.model(collectionRef,schemaRef);',
        '                }',
        '            }',
        '            catch(ex){',
        '            }',
        '        }',
        '        if (!collections[collection]){',
        '            collections[collection]=  mongoose.model(collection,newSchema);',
        '        }',
        '        fun(collections[collection],undefined,listOfReferences)',
        '    }',
        '}'
    ].join(eol);

    var _obj_sql_file = function(conn) {
        if (program.postgre)
            engine = 'pg';
        if (program.sqlite)
            engine = 'sqlite3';
        if (program.mysql)
            engine = 'mysql';

        return [
            'module.exports = {',
            '	sysDate: function(){',
            '			return new DBExpr(\'NOW()\')',
            '	},',
            '	conn:function (fun){',
            '		try{',
            '           var DBWrapper = require(\'node-dbi\').DBWrapper; ',
            '           var DBExpr = require(\'node-dbi\').DBExpr;',
            '           var dbConnectionConfig =' + conn + ';',
            '           dbWrapper = new DBWrapper( \'' + engine + '\', dbConnectionConfig );',
            '			dbWrapper.connect();',
            '			fun(dbWrapper,null)', //No error return in null
            '		}',
            '		catch(ex){',
            '			fun(null,ex);',
            '		}',
            '	},',
            '   close:function(){',
            '		dbWrapper.close( function(err) {if(err){consloe.log(err)}} );',
            '	}',
            '}'
        ].join(eol);
    };

    _obj_Jade_rows = [
        '      each el in ' + process.argv[2],
        '        tr'];



    var _obj_jade_layout = [
        'doctype html',
        'html',
        '  head',
        '    title= title',
        '    ' + metaMobile,
        '    ' + bstwCss,
        '    ' + JqJs,
        '    ' + bstwJs,
        '    ' + skioJs,
        '    link(rel=\'stylesheet\', href=\'/stylesheets/style.css\')',
        '  body.container-fluid',
        '    .row',
        '      include nav',
        '      block content'
    ].join(eol);

    var _str_Jade = [
        'extends layout'
                , 'block content'
                , '  .col-md-8'
                , '    ul.nav.nav-pills.nav-justified'
                , '      li.active'
                , '        a(href=\"/' + process.argv[2] + '\") ' + capitalise(process.argv[2])
                , '      li'
                , '        a(href=\"/' + process.argv[2] + '/new\") New'
                , '    table#tRows.table'
                , '      tr'
                , '        td(colspan=' + _int_columns_count + ')#tTitle #{title}'
                , '      tr'
                , ''
    ].join(eol);

    var _str_Jade_new = [
        'extends layout'
                , 'block content'
                , '  .col-md-8'
                , '    ul.nav.nav-pills.nav-justified'
                , '      li'
                , '        a(href=\"/' + process.argv[2] + '\") ' + capitalise(process.argv[2])
                , '      li.active'
                , '        a(href=\"/' + process.argv[2] + '/new\") New'
                , '      form(method=\"POST\")'
                , '#inputs'
                , '        button.btn.btn-primary(type="submit") Accept '
                , '        if ' + process.argv[2] + ''
                , '          a(href="/' + process.argv[2] + '/#{' + process.argv[2] + '._id}/delete").btn.btn-danger Delete'
    ].join(eol);


    var _str_input = function(el, type) {
        return [
            '        .form-group'
                    , '          label(for=\"' + el + '\") ' + capitalise(el)
                    , '          input.form-control#' + el + '(type=\"' + type + '\",placeholder=\"' + el + '\",name=\"' + el + '\",value=\"#{(' + process.argv[2] + '?' + process.argv[2] + '.' + el + ':\'\')}\")'
        ].join(eol);
    };

    var _ref_input = function(el) {
        return [
            '        .form-group'
                    , '          label(for=\"' + el + '\") ' + capitalise(el)
                    , '          select.form-control#' + el + '(placeholder=\"' + el + '\",name=\"' + el + '\",value=\"#{(' + process.argv[2] + '?' + process.argv[2] + '.' + el + '[0]._id:\'\')}\")'
                    , '          script.'
                    , '             $(function () {'
                    , '                 connection.getRefData(\'' + el + '\',\'_id\',\'#{(' + process.argv[2] + '?' + process.argv[2] + '.' + el + '[0]._id:\'\')}\');'
                    , '             });'
        ].join(eol);
    };

    var _str_check = function(el) {
        return [
            '        .checkbox'
                    , '          label'
                    , '            if ' + process.argv[2] + '.' + el + '==\"' + el + '\"'
                    , '              input(type="checkbox",value=\"' + el + '\",checked="checked") '
                    , '              | ' + capitalise(el)
                    , '            else'
                    , '              input(type="checkbox",value=\"' + el + '\") '
                    , '              | ' + capitalise(el)
        ].join(eol);
    };

    var _str_inputs = [];

    var _str_Jade_nav = [
        , '.col-md-4'
                , '  ul.nav.nav-pills.nav-stacked'
                , '    //newItem'
    ].join(eol);



    var _obj_js_SocketIo = [
        '   var connection = {',
        '       getRefData:function (ref,field) {',
        '           if(!field){field = \'_id\'}',
        '           $.ajax({',
        '               dataType: "json",',
        '               url: \'/\' + ref + \'/list.json\',',
        '               success: function (json) {',
        '                   $.each(json.data,function (index, element) {',
        '                       $("#" + ref).append($("<option>").attr("value",element._id).text(element[field]));',
        '                   })',
        '                   $("#" + ref).val($("#" + ref).attr("value"));',
        '               }',
        '           });',
        '       }',
        '   }'
    ].join(eol);

    fs.readFile(path + '/public/javascripts/connection.js', function(err, data) {
        if (err) {
            fs.writeFile(path + '/public/javascripts/connection.js', _obj_js_SocketIo + '\n');
            console.log('See the "public/javascripts/connection.js" file');
        }
    });



    var _obj_model_file = function(tableName, fieldList) {
        var _int_count_params = fieldList.split(",").length;
        var _arr_params = fieldList.split(",");
        var _str_values = '';
        var _str_values_update = '';
        var td_link = ['        td'
                    , '          a(href="/' + process.argv[2] + '/#{el._id}") #{el._id}'
        ].join(eol);
        _obj_Jade_rows[_obj_Jade_rows.length] = td_link;
        for (var i = 0; i < _int_count_params; i++) {
            _str_values += (i < _int_count_params - 1 ? '?,' : '?');
            _str_values_update += _arr_params[i] + (i < _int_count_params - 1 ? ' = ?,' : '= ?');
            if (_arr_params[i].length > 0) {
                _obj_Jade_rows[_obj_Jade_rows.length] = '        td= el.' + _arr_params[i];
            }
        }
        ;

        _str_MONGO_Object = 'mongoObj = {\n';
        _str_MONGO_polulate = '';
        process.argv.forEach(function(val, index, array) {
            if (index > 2 && fullPrams.indexOf(val) === -1) {
                var _str_name = val.split(":")[0];
                var _data_type = val.split(":")[1];
                if (index === 3) {

                }
                if (_data_type === 'ref') {
                    _str_MONGO_polulate = _str_MONGO_polulate + '.populate(\'' + _str_name + '\')\n';
                    _str_MONGO_Object = _str_MONGO_Object + '        ' + (index > 3 ? ',' : '') + _str_name + ':' + "[{ type: Schema.Types.ObjectId, ref: '" + _str_name + "' }]" + '\n';
                } else {
                    _str_MONGO_Object = _str_MONGO_Object + '        ' + (index > 3 ? ',' : '') + _str_name + ':' + toMongoDataType(_data_type) + '\n';
                }



            }
            if (index === process.argv.length - 1)
            {
                _str_MONGO_Object += '\n}\n';
            }
        });

        var mySqlStatement = ['var connection = require(\'../connection\');',
            'module.exports = { ',
            '	insert: function(params, _function){',
            '   	connection.conn(function(db,err) {',
            '           if(err){console.log(err);}',
            '			db.insert(\'' + tableName + '\', params , function(err) {',
            '               if(err){console.log(err);}',
            '				_function(dbWrapper.getLastInsertId() || 0,err);',
            '				connection.close();',
            '           })',
            '		});',
            '	},',
            '	find: function(params, _function){',
            '   	connection.conn(function(db,err) {',
            '           if(err){console.log(err);}',
            '			db.fetchAll("Select _id, ' + fieldList + ' FROM ' + tableName + ' where _id=?", params , function(err,results) {',
            '              if(err){console.log(err);}',
            '				_function(results,err);',
            '				connection.close();',
            '           })',
            '		});',
            '	},',
            '	list: function(params, page,  _function){',
            '   	connection.conn(function(db,err) {',
            '           if(err){console.log(err);}',
            '			db.fetchAll("Select _id, ' + fieldList + ' FROM ' + tableName + ' limit 1000", null , function(err,results) {',
            '              if(err){console.log(err);}',
            '				_function(results,err);',
            '				connection.close();',
            '           })',
            '		});',
            '	},',
            '	update: function(params,id, _function){',
            '   	connection.conn(function(db,err) {',
            '           if(err){console.log(err);}',
            '			db.update(\'' + tableName + '\' , params, [\'_id=?\', id] , function(err,results) {',
            '              if(err){console.log(err);}',
            '				_function(results,err);',
            '				connection.close();',
            '           })',
            '		});',
            '	},',
            '	delete: function(params,id, _function){',
            '   	connection.conn(function(db,err) {',
            '           if(err){console.log(err);}',
            '			db.remove(\'' + tableName + '\', [\'_id=?\', id] , function(err,results) {',
            '              if(err){console.log(err);}',
            '				_function(results,err);',
            '				connection.close();',
            '           })',
            '		});',
            '	},',
            '}'].join(eol);

        var mongoStatement = ['var connection = require(\'../connection\');',
            'var mongoose = require(\'mongoose\')',
            ', Schema = mongoose.Schema',
            'var mySelf = { ',
            '	getMongoObj: function(params){',
            '		' + _str_MONGO_Object + ' ',
            '		return mongoObj;',
            '	},',
            '	insert: function(params, _function){',
            '			schema = mySelf.getMongoObj();',
            '           connection.open(\'' + tableName + '\',schema ,function(collection,error) {',
            '				if(error){ _function(undefined,error); return false; }',
            '				collection.create(params,function(err, docs){',
            '					_function(docs,err)',
            '            	})',
            '          	})',
            '	},',
            '	find: function(id, _function){',
            '			schema = mySelf.getMongoObj();',
            '           connection.open(\'' + tableName + '\',schema ,function(collection,error) {',
            '			var query = collection.find({_id:connection.ObjetId(id)})',
            '           query' + _str_MONGO_polulate + '.exec(function(err, docs) { ',
            '					_function(docs,err)',
            '            	})',
            '          	})',
            '	},',
            '	list: function(params,page, _function){',
            '			schema = mySelf.getMongoObj();',
            '			if(typeof page === "function"){_function = page; page = 0 ;}',
            '           connection.open(\'' + tableName + '\',schema ,function(collection,error) {',
            '				var query = collection.find({})',
            '               query' + _str_MONGO_polulate + '.exec(function(err, docs) { ',
            '					_function(docs,err)',
            '            	})',
            '          	})',
            '	},',
            '	update: function(params,id, _function){',
            '			schema = mySelf.getMongoObj();',
            '			var whereObject ;',
            '			if(typeof id === "function"){_function = id; id = 0 ;}',
            '			if(id===0){',
            '				whereObject = {\'' + _arr_params[0] + '\':params[0]};',
            '			}else{',
            '				whereObject = {_id:connection.ObjetId(id)};',
            '			}',
            '           connection.open(\'' + tableName + '\',schema ,function(collection,error) {',
            '				collection.update(whereObject,{$set:params},{multi:true},function(err, docs) { ',
            '					_function(docs,err) ',
            '            	})',
            '          	})',
            '	},',
            '	delete: function(params,id, _function){',
            '			var whereObject ;',
            '			if(typeof id === "function"){_function = id; id = 0 ;}',
            '			if(id===0){',
            '				whereObject = {\'' + _arr_params[0] + '\':params[0]};',
            '			}else{',
            '				whereObject = {_id:id};',
            '			}',
            '			schema = mySelf.getMongoObj();',
            '           connection.open(\'' + tableName + '\',schema ,function(collection,error) {',
            '				if(error){ _function(undefined,error); return false; }',
            '				collection.remove(whereObject,function () {',
            '				})',
            '				mySelf.list([],0, _function) ',
            '          	})',
            '	}',
            '}',
            'module.exports = mySelf;'].join(eol);

        var conectionEngine;
        if (program.mongo) {
            conectionEngine = mongoStatement;
        }
        if (program.postgre || program.mysql || program.sqlite) {
            conectionEngine = mySqlStatement;
        }
        return 	conectionEngine;
    };



    var _obj_Route = [
        'var express = require(\'express\');'
                , 'var router = express.Router();'
                , 'var ' + process.argv[2] + '= require(\'../models/_' + process.argv[2] + '\');'
                , '_idToString = function (r) {'
                , '	for (i=0;i<r.length;i++){'
                , '	r[i]._id = r[i]._id.toString();'
                , '	}'
                , 'return r'
                , '}'
                , ' _toList = function (req, res) {'
                , '      res.redirect(\'' + process.argv[2] + '/list\');'
                , '};'
                , ' _list = function(req, res){'
                , '	' + process.argv[2] + '.list([],0,function(r,f) {'
                , '		try{'
                , '			r= _idToString(r);'
                , '         if (req.params.format !="json"){'
                , ' 			res.render(\'' + process.argv[2] + '\', { title: \'' + capitalise(process.argv[2]) + '\', ' + process.argv[2] + ' : r });'
                , '         }else{'
                , '             res.send({data:r})'
                , '         }'
                , '		}catch(ex){'
                , '		}'
                , '	})'
                , '};'
                , ' _new = function(req, res){'
                , '	res.render(\'__route_new\', { title: \'new __tile\' });'
                , '};'
                , ' _delete = function(req, res){'
                , '	var _id = req.params.id;'
                , '	' + process.argv[2] + '.delete([],_id,function(r,f) {'
                , '		try{'
                , '			r= _idToString(r);'
                , '			res.render(\'' + process.argv[2] + '\', { title: \'' + capitalise(process.argv[2]) + '\', ' + process.argv[2] + ' : r });'
                , '		}catch(ex){'
                , '		}'
                , '	})'
                , '};'
                , ' _update = function(req, res){'
                , '	var _id = req.params.id;'
                , '	if (_id){'
                , '	' + process.argv[2] + '.update(req.body,_id,function(r,f) {'
                , '		try{'
                , '			r= _idToString(r);'
                , '			res.render(\'' + process.argv[2] + '_new\', { title: \'' + capitalise(process.argv[2]) + '\', ' + process.argv[2] + ' : r[0] });'
                , '		}catch(ex){'
                , '		}'
                , '	})'
                , '}else{'
                , '	' + process.argv[2] + '.insert(req.body,function(r,f) {'
                , '		try{'
                , '			r = _idToString(r);'
                , '			res.render(\'' + process.argv[2] + '_new\', { title: \'' + capitalise(process.argv[2]) + '\', ' + process.argv[2] + ' : r[0] });'
                , '		}catch(ex){'
                , '		}'
                , '		})'
                , '	}'
                , '};'
                , ' _range = function(req, res){'
                , '\tres.render(\'__route_range\', { title: \'__tile\' });'
                , '};'
                , ' _get = function(req, res){'
                , '     var _id = req.params.id.split(".")[0];'
                , '     var _format = req.params.id.split(".")[1];'
                , '	    ' + process.argv[2] + '.find(_id,function(r,f) {'
                , '	    try{'
                , '		   r = _idToString(r);'
                , '         if (_format !="json"){'
                , '		       res.render(\'' + process.argv[2] + '_new\', { title: \'' + capitalise(process.argv[2]) + '\', ' + process.argv[2] + ' : r[0] });'
                , '         }else{'
                , '             res.send({data:r})'
                , '         }'
                , '	    }catch(ex){'
                , '  }'
                , '})'
                , '};'
                , '/*'
                , 'Excaffold generated routes'
                , '*/'
                , 'router.get(\'/\',_toList);'
                , 'router.get(\'/list\',_list);'
                , 'router.get(\'/list.:format/\',_list);'
                , 'router.get(\'/new\', _new);'
                , 'router.post(\'/new\', _update);'
                , 'router.get(\'/:id/delete\', _delete);'
                , 'router.delete(\'/:id\', _delete);'
                , 'router.get(\'/:id/update\', _update);'
                , 'router.get(\'/:id/range\',_range);'
                , 'router.get(\'/:id\', _get);'
                , 'router.post(\'/:id\', _update);'
                , 'router.put(\'/:id\', _update);'
                , 'module.exports = router;'
    ].join(eol);

    var _str_app_list = [
        '/* Excaffold Element */'
                , 'var ' + process.argv[2] + ' = require(\'./routes/' + process.argv[2] + '\');'
                , 'app.use(\'/' + process.argv[2] + '\', ' + process.argv[2] + ');'
                , ''
    ].join(eol);

    fs.readFile(path + '/sql.json', function(err, data) {
        if (err) {
            fs.writeFile(path + '/sql.json', JSON.stringify(_obj_SQL_Config) + '\n');
            console.log('See the "sql.json" file');
        } else {
            _obj_SQL_Config = JSON.parse(data);

        }


        _str_JSON_Object = '//Model Name ' + process.argv[2] + '.json\n';

        var primaryKey = "";
        var autoIncrement = "";
        var database = "";

        if (program.postgre) {
            database = "";
        }
        if (program.mysql) {
            primaryKey = "";
            autoIncrement = " AUTO_INCREMENT "
            database = _obj_SQL_Config.database + '.';
        }
        if (program.sqlite) {
            primaryKey = " PRIMARY KEY ";
            autoIncrement = "";
            database = "";
        }



        _str_SQL_Query = 'CREATE TABLE IF NOT EXISTS ' + database + process.argv[2] + ' ( _id ' + (program.postgre ? " SERIAL " : " INT ") + primaryKey + 'NOT NULL ' + autoIncrement + ', ';
        _str_JSON_Object = _str_JSON_Object + '\n';
        _str_JSON_Object = _str_JSON_Object + '{\n';

        _str_SQL_Fields = '';
        _str_Jade += '      td _id' + '\n';
        process.argv.forEach(function(val, index, array) {
            console.log("Creating ", val);

            if (index > 2 && fullPrams.indexOf(val) === -1) {
                console.log("Creating ", val);

                var _str_name = val.split(":")[0];
                var _str_type = val.split(":")[1];

                _str_Jade += '      td ' + _str_name + '\n';
                _str_JSON_Object = _str_JSON_Object + '\t"' + _str_name + '":"' + _str_type + '"';

                var newImputElement = "";

                switch (capitalise(_str_type))
                {
                    case 'Date' :
                    case 'Datetime' :
                    case 'Timestamp':
                        {
                            newImputElement = _str_input(_str_name, 'date');
                        }
                        break;
                    case 'tTinyInt':
                    case'SmallInt':
                    case'MediumInt':
                    case'Integer':
                    case'Int':
                    case'BigInt':
                    case'Numeric':
                        {
                            newImputElement = _str_input(_str_name, 'number');
                        }
                        break;
                    case 'TinyText':
                    case 'TinyBlob' :
                    case 'Blob' :
                    case 'Text':
                    case 'MediumBlob' :
                    case 'MediumText':
                    case 'LongBlob' :
                    case 'LongText':
                    case 'Float':
                    case 'xReal':
                    case 'Double':
                    case 'Decimal':
                    case 'Dec':

                        {
                            newImputElement = _str_input(_str_name, 'text');
                        }
                        break;
                    case 'Ref':
                        {
                            newImputElement = _ref_input(_str_name);
                        }
                        break;
                    case 'Bit' :
                    case 'Bool' :
                    case 'Boolean':
                        {
                            newImputElement = _str_check(_str_name);
                        }
                        break;

                }
                console.log(_str_SQL_Query);
                _str_inputs[_str_inputs.length] = newImputElement;
                if (program.mysql) {
                    _str_SQL_Query += _str_name + ' ' + _str_type.replace('text', 'VARCHAR(50) CHARACTER SET utf8 COLLATE utf8_bin ');
                }
                if (program.postgre || program.sqlite) {
                    _str_SQL_Query += _str_name + ' ' + _str_type;
                }
                _str_SQL_Fields += _str_name;

                if (index < process.argv.length - 1 && fullPrams.indexOf(process.argv[index + 1]) === -1)
                {
                    _str_JSON_Object += ',\n';
                    _str_SQL_Query += ',';
                    _str_SQL_Fields += ',';

                }
            }

        });

        if (program.mysql || program.postgre) {
            _str_SQL_Query = _str_SQL_Query + '  ,PRIMARY KEY (_id));';
        }
        if (program.sqlite) {
            _str_SQL_Query = _str_SQL_Query + '); ';
        }

        _str_JSON_Object = _str_JSON_Object + '\n}\n';

        _str_JSON_Object = _str_JSON_Object + '//sql_query: ' + _str_SQL_Query;

        fs.mkdir('models', function(arg) {
            fs.writeFile(path + '/models/_' + process.argv[2] + '.js', _obj_model_file(process.argv[2], _str_SQL_Fields));
            fs.writeFile(path + '/models/' + process.argv[2] + '.json', _str_JSON_Object);
            _str_Jade += _obj_Jade_rows.join(eol);
            if (program.mysql || program.postgre || program.sqlite) {
                engine
                if (program.mysql) {
                    engine = "mysql";
                }
                if (program.postgre) {
                    engine = "pg";
                }
                if (program.sqlite) {
                    engine = "sqlite3";
                }
                connection = getConnection(engine, _obj_SQL_Config);

                connection.query(_str_SQL_Query, [], function(err, rows) {
                    if (err) {
                        if (err.code === "ER_BAD_DB_ERROR") {
                            console.log("The DB '" + _obj_SQL_Config.database + "' doesn't exist, I will create it...");
                            connection.query("CREATE DATABASE " + _obj_SQL_Config.database, function(err, rows) {
                                connection.query(_str_SQL_Query, function(err, rows) {
                                    createFiles();
                                });
                            });
                        } else {
                            console.log(JSON.stringify(err));
                        }
                    } else {
                        createFiles();
                    }
                });
            } else {
                createFiles();
            }
        });

        function createFiles() {


            fs.mkdir('routes', function(arg) {
                fs.writeFile(path + '/routes/' + process.argv[2] + '.js', _obj_Route.replace(/__route/g, process.argv[2])
                        .replace(/__tile/g, process.argv[2]), function() {

                    fs.mkdir(path + '/views', function(arg) {
                        fs.readFile(path + '/views/layout.jade', function(err, data) {
                            data = data.toString();
                            if (onlyEntity === false) {
                                fs.writeFile(path + '/views/layout.jade', _obj_jade_layout, function() {
                                    console.log('See the "views/layout.jade" file');
                                });
                            }
                        });
                    });
                    fs.readFile(path + '/views/nav.jade', function(err, data) {
                        var _str_nav_li = ["li",
                            "      a(href='/" + process.argv[2] + "') " + capitalise(process.argv[2]),
                            "    //newItem "
                        ].join(eol);

                        if (!err) {
                            _str_Jade_nav = data.toString();
                        }

                        fs.writeFile(path + '/views/nav.jade', _str_Jade_nav.replace("//newItem", _str_nav_li), function() {
                            console.log('See the "views/layout.jade" file');
                        });
                    });
                    fs.writeFile(path + '/views/' + process.argv[2] + '.jade', _str_Jade, function() {
                        var newInputs = _str_inputs.join(eol);

                        fs.writeFile(path + '/views/' + process.argv[2] + '_new.jade', _str_Jade_new.replace("#inputs", newInputs), function() {

                        });
                        fs.readFile(path + '/app.js', function(err, data) {
                            data = data.toString()
                                    .replace(_str_app_list.toString(), '')
                                    .replace("app.use(express.static(path.join(__dirname, 'public')));", "app.use(express.static(path.join(__dirname, 'public')));" + _str_app_list);


                            fs.writeFile(path + '/app.js', data, function() {
                                if (program.mongo) {
                                    console.log('Now run > npm install mongoose');
                                }
                                console.log('See the "app.js" file');
                                console.log('3 - Now run > node app.js ');
                                process.exit(code = 0);
                            });
                        });
                    });
                });
            });
        }
        if (onlyEntity === false) {
            var conectionEngine;
            if (program.mongo) {
                conectionEngine = _obj_mongo_file;
            }
            if (program.mysql) {
                var conn = {
                    host: _obj_SQL_Config.host,
                    user: _obj_SQL_Config.user,
                    password: _obj_SQL_Config.password
                }
                conectionEngine = _obj_sql_file(JSON.stringify(conn));
            }
            if (program.postgre) {
                var conn = {
                    host: _obj_SQL_Config.host,
                    user: _obj_SQL_Config.user,
                    password: _obj_SQL_Config.password,
                    database: _obj_SQL_Config.database
                }
                conectionEngine = _obj_sql_file(JSON.stringify(conn));
            }
            if (program.sqlite) {
                var conn = {
                    database: _obj_SQL_Config.database
                }
                conectionEngine = _obj_sql_file(JSON.stringify(conn));
            }
            fs.writeFile(path + '/connection.js', conectionEngine, function() {
                console.log('Use the "connection.js" file for connect to the DB');
            });
        }
    });
}





