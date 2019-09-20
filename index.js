const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const methodOverride = require('method-override');

const app = express();

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs({
  defaultLayout: 'main',
  layoutsDir: path.join(app.get('views'), 'layouts'),
  partialsDir: path.join(app.get('views'), 'partials'),
  extname: '.hbs'
}));
app.set('view engine', '.hbs');


app.use(express.urlencoded({extended: false}));
app.use(methodOverride('_method'));

// archivos de ruta de cada entidad de la aplicacion
// ahora solo "usuario" y "issue" por luego se suman las rutas de "cliente", "proveedores", "contactos", etc.
app.use(require('./routes/usuario'));
app.use(require('./routes/issue'));


app.use(express.static(path.join(__dirname, 'public')));


app.listen(app.get('port'), () => {
  console.log('Escuchando en Puerto', app.get('port'));
});
