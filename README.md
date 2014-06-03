## Excaffold

## Source Code
* Visit us in [GitHub](https://github.com/develasquez/excaffold) 
* Visit us in [npm](https://www.npmjs.org/package/excaffold) 

## Installation
$ npm install -g excaffold

## How to Use
1 - Create an Express Project:

	$ express prueba 

	$ cd prueba && npm install:

2 - Create a new Model ie: 

	$ excaffold tableName field1Name:dataType field2Name:int field3:boolean

	$prompt: Project_Name:  prueba

	Command-line input received:
	Project Name : prueba
	See the "public/javascripts/connection.js" file
	See the "sql.json" file
	Use the "connection.js" file for connect to the DB
	See the "views/layout.jade" file
	1 - run > npm install socket.io
	2 - run > npm install mongoose
	See the "app.js" file
	3 - Now run > node app.js


	$ npm install socket.io

	$ npm install mongoose

3- Run your Node Project:

	$ node app.js 

## Relationals Models
* To create a new related model (Like SQL Inner Join)

$ excaffold otherTable field1Name:dataType field2Name:int tableName:ref

