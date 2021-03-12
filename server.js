var express = require('express')

var reader = require("xlsx");
var xlstojson = require("xls-to-json");
const {graphqlHTTP} = require('express-graphql')
var cors = require('cors');
var app = express()
app.use(cors())


app.use(function(req, res, next) { //allow cross origin requests
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");
    res.header("Access-Control-Max-Age", "3600");
    res.header("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
    next();
});

// configuration
app.use(express.static(__dirname + '/public'));
app.use('/public/uploads',express.static(__dirname + '/public/uploads'));

const file = reader.readFile('./BDD-Pays-V0.xlsx')
let data = []
const sheets = file.SheetNames
for(let i = 0; i < sheets.length; i++)
{
   const temp = reader.utils.sheet_to_json(
        file.Sheets[file.SheetNames[i]])
   temp.forEach((res) => {
      data.push(res)
   })
}

let test = JSON.stringify(data, null, 2);
const fs = require('fs');
fs.writeFile('output.json', test, (err) => {
    if (err) throw err;
    console.log('Data written to file');
});


const dataPath = './output.json';


app.get('/pays', (req, res) => {
	fs.readFile(dataPath, 'utf8', (err, data) => {
	if (err) {
			throw err;
		}

	res.send(JSON.parse(data));
	});
});

const countryData = require("./MOCK_DATA.json");
const{
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInt,
    GraphQLNonNull
} = require('graphql')
const CountryType =new GraphQLObjectType({
    name:'country',
    fields:()=>({

        Continent:{type:GraphQLNonNull(GraphQLString)},
		Superficie:{type:GraphQLNonNull(GraphQLString)},
		Pays_partenaires_Trade_Map:{type:GraphQLNonNull(GraphQLString)},
		Capitale:{type:GraphQLNonNull(GraphQLString)},
		IDH:{type:GraphQLNonNull(GraphQLString)},
		Monnaie:{type:GraphQLNonNull(GraphQLString)},
		Regime_politique:{type:GraphQLNonNull(GraphQLString)},
		Langue_Commerciale:{type:GraphQLNonNull(GraphQLString)},

    })
})
const RootQueryType = new GraphQLObjectType({
	name: 'Query',
	description: 'Root Query',
	fields: () => ({
	  countrySingle: {
		type: CountryType,
		description: 'A Single Country',
		args: {
			Continent:{type:GraphQLString},
			Superficie:{type:GraphQLString},
		  Pays_partenaires_Trade_Map:{ type: GraphQLString},
		  Capitale:{type:GraphQLString},
		  IDH:{type:GraphQLString},
		  Monnaie:{type:GraphQLString},
		  Regime_politique:{type:GraphQLString},
		  Langue_Commerciale:{type:GraphQLString},
		},
		resolve: (parent, args) => countryData.find(book => book.Pays_partenaires_Trade_Map === args.Pays_partenaires_Trade_Map)
	  },
	  countryData: {
		type: new GraphQLList(CountryType),
		description: 'List of All Countries',
		resolve: () => countryData
	  },

	})
  })

const schema =new GraphQLSchema({
    query:RootQueryType
})
app.use('/graphql', graphqlHTTP({
	graphiql:true,
	schema:schema
	}))

  app.listen(3400)
