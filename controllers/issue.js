//let conex = require('../database.js');

var mysql = require('mysql');
//var bcrypt = require('bcrypt-nodejs');
var dbconfig = require('../database');
var conex = mysql.createConnection(dbconfig.connection);

conex.query('USE ' + dbconfig.database);


async function getIssues(req, res){
    console.log ('paso');
    sql = "SELECT ISS.id, ISS.nombre, ISS.descripcion, CONCAT(PER.nombre, ' ', PER.apellido) AS responsable, PER.url_img_perfil, REL.tx_issue_relevancia, DATE_FORMAT(vencimiento, '%d/%m/%Y') as vencimiento, EST.tx_issue_estado, EST.css FROM issue as ISS LEFT JOIN personal as PER ON PER.id = ISS.personal_id LEFT JOIN issue_relevancia as REL ON REL.id = ISS.relevancia_issue_id LEFT JOIN issue_estado as EST ON EST.id = ISS.estado_issue_id";
    console.log ('paso');        
    conex.query(sql, function(error, resultado, fields){
        if (error) {
            console.log("Ha ocurrido un error en la consulta", error.message);
            return res.status(404).send("Ha ocurrido un error en la consulta");
        }

        res.render('issue/all-issue', {resultado, layout: 'main'});
        

    });
}


async function issueRender(req, res){
    sql = "select id, CONCAT(nombre, ' ', apellido) AS responsable from personal";
    conex.query(sql, function(error, result_personal, fields){
        if (error) {
            console.log("Ha ocurrido un error en la consulta", error.message);
            return res.status(404).send("Ha ocurrido un error en la consulta");
        }
        sql = "select id, tx_issue_relevancia from issue_relevancia";
        conex.query(sql, function(error, result_relevancia, fields){
            if (error) {
                console.log("Ha ocurrido un error en la consulta", error.message);
                return res.status(404).send("Ha ocurrido un error en la consulta");
            }
            res.render('issue/new-issue', {result_personal, result_relevancia, layout:'main'});
        });

    });
}



async function newIssue(req, res){
    const {nombre, descripcion, relevancia, responsable, vencimiento} = req.body;
    const errors = [];
    if (!nombre) {
        errors.push({text: 'Ingrese nombre de tarea.'});
    }
    if (!descripcion) {
        errors.push({text: 'Ingrese descripcion de la tarea.'});
    }
    if (!relevancia) {
       errors.push({text: 'Seleccione Relevancia de la tarea.'});
    }
    if (!responsable) {
        errors.push({text: 'Seleccione Responsable de la tarea.'});
    }    
    if (!vencimiento) {
        errors.push({text: 'Seleccione Vencimiento de la tarea.'});
    }    
     
    if (errors.length > 0) {
        res.render('issue/new-issue', {
        errors,
        nombre,
        descripcion,
        relevancia,
        responsable,
        vencimiento,
        layout: 'main'
        });
    } else {
        sql = "INSERT INTO issue (`nombre`, `descripcion`, `personal_id`, `relevancia_issue_id`, `vencimiento`, `estado_issue_id`) VALUES ('" + nombre + "', '" + descripcion + "', " + responsable + ", "+relevancia+", '"+vencimiento+"', 1)";
        conex.query(sql, function(error, resultado, fields){
            if (error) {
                console.log("Ha ocurrido un error en la consulta", error.message);
                return res.status(404).send("Ha ocurrido un error en la consulta");
            }
            res.redirect('/issue');
        });
    }
}


function issueEditRender(req, res){
    if (!isNaN(req.params.id)) { ////// solo la primera vez entra y luego vuelve a intentar  ??????
        sql = "SELECT ISS.id, ISS.nombre, ISS.descripcion, CONCAT(PER.nombre, ' ', PER.apellido) AS responsable, PER.url_img_perfil, REL.tx_issue_relevancia, DATE_FORMAT(vencimiento, '%Y-%m-%d') as vencimiento, EST.tx_issue_estado, personal_id, relevancia_issue_id, estado_issue_id, EST.css FROM issue as ISS LEFT JOIN personal as PER ON PER.id = ISS.personal_id LEFT JOIN issue_relevancia as REL ON REL.id = ISS.relevancia_issue_id LEFT JOIN issue_estado as EST ON EST.id = ISS.estado_issue_id WHERE ISS.id = '"+req.params.id+"'";
        conex.query(sql, function(error, result_issue, fields){
            sql = "select id, CONCAT(nombre, ' ', apellido) AS responsable from personal";
            conex.query(sql, function(error, result_personal, fields){
                sql = "select id, tx_issue_relevancia from issue_relevancia";
                conex.query(sql, function(error, result_relevancia, fields){
                    sql = "select id, tx_issue_estado from issue_estado";
                    conex.query(sql, function(error, result_estado, fields){
                        result_issue = result_issue[0];
                        res.render('issue/edit-issue', {result_issue, result_personal, result_relevancia, result_estado, layout:'main'});                 
                    });    
                    
                });
            });
        }); 

    } else {
        console.log('paso si que lo llamen -> GUORNINGGGG!!!!');
    }
}
    
function issueEdit(req, res){
    const {nombre, descripcion, relevancia, responsable, vencimiento, estado} = req.body;
    //const {nombre, descripcion, relevancia, responsable, vencimiento} = req.body;
    let id = req.params.id;
    console.log ('id :'+id+'\n');
    console.log ('nombre :'+nombre+'\n');
    console.log ('descripcion :'+descripcion+'\n');
    console.log ('+relevancia :'+relevancia+'\n');
    console.log ('responsable :'+responsable+'\n');
    console.log ('vencimiento :'+vencimiento+'\n');
    console.log ('Estado :'+estado+'\n');
    
    sql = "UPDATE issue SET nombre = '"+nombre+"', descripcion = '"+descripcion+"', personal_id = "+responsable+", relevancia_issue_id = "+relevancia+", vencimiento = '"+vencimiento+"', estado_issue_id = "+estado+" WHERE id = "+id;
    console.log(sql);
    conex.query(sql, function(error, resultado, fields){
        if (error) {
            console.log("Ha ocurrido un error en la consulta", error.message);
            return res.status(404).send("Ha ocurrido un error en la consulta");
        }
        //req.flash('success_msg', 'Tarea Actualizada');
        res.redirect('/issue');
    });
}


module.exports = {
    getIssues,
    issueRender,
    newIssue,
    issueEditRender,
    issueEdit
};
