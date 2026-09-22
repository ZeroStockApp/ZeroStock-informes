// INFO
let filaEditando = null;
const error = document.querySelector('#error');
function ubicarErrorSegunTipo() {
  if (!error) return;
  const tipo = document.getElementById('tipo-informe')?.value;
  const bloqueTallas = document.getElementById('bloque-tallas');
  const bloqueCantidad = document.getElementById('bloque-cantidad');

  // Mueve el <div id="error"> antes del bloque correspondiente
  if (tipo === "2" && bloqueCantidad) {
    bloqueCantidad.insertAdjacentElement('beforebegin', error);
  } else if ((tipo === "1" || tipo === "3") && bloqueTallas) {
    bloqueTallas.insertAdjacentElement('beforebegin', error);
  }
}

function mostrarError(msg) {
  if (!error) return;
  ubicarErrorSegunTipo();
  error.textContent = msg;
  error.style.display = 'block';
}

function limpiarError() {
  if (!error) return;
  error.textContent = '';
  error.style.display = 'none';
}

const tipoInforme = document.querySelector('#tipo-informe');
const distribuidor = document.querySelector('#distribuidor');
// --- Validación común: exigir distribuidor seleccionado
function exigirDistribuidor() {
  // selectedIndex 0 es "Seleccione un distribuidor"
  if (!distribuidor || distribuidor.selectedIndex <= 0) {
    alert('Debes seleccionar un DISTRIBUIDOR antes de continuar.');
    if (distribuidor) distribuidor.focus();
    return false;
  }
  return true;
}
// ESTADO ITEM
const estadoBueno = document.querySelector('#estado-bueno');
const estadoDefecto = document.querySelector('#estado-defecto');
const boxDefecto = document.querySelector('#box-defecto');
const defecto = document.querySelector('#defecto');
// ITEM
const codigo = document.querySelector('#codigo');
const botonBuscar = document.querySelector('#boton-buscar');
const nombre = document.querySelector('#nombre');
const cantidad = document.querySelector('#cantidad');
// OPCIONES
const botonLimpiar = document.querySelector('#boton-limpiar');
const botonCrear = document.querySelector('#boton-crear');
const botonBipear = document.querySelector('#boton-bipear'); 
const botonAgregar = document.querySelector('#boton-agregar'); 
const botonPdf = document.querySelector('#boton-pdf');

// PDF
const pdf = document.querySelector('#pdf');
const pdfEncabezado = document.querySelector('#pdf-encabezado');
const tituloInforme = document.querySelector('#titulo-informe');
const tituloDistribuidor = document.querySelector('#titulo-distribuidor');
const tituloSemana = document.querySelector('#titulo-semana');
const tituloFecha = document.querySelector('#titulo-fecha'); 
// TABLA
const tabla = document.querySelector('table');
const tbody = document.querySelector('#tbody');
const botonEliminar = document.querySelectorAll(".boton-eliminar");
const total = document.querySelector('#total');
const itemEncabezado = document.querySelector('#item-encabezado');
// MODAL-1
const modal1 = document.querySelector('#modal-1');
const m1Consulta = document.querySelector('#m1-consulta');
const m1Buscar = document.querySelector('#m1-buscar');
const m1Cerrar = document.querySelector('#m1-cerrar'); 
const m1Tabla = document.querySelector('#m1-tabla'); 
const m1Tbody = document.querySelector('#m1-tbody');  
const m1Contenido = document.querySelector('#m1-contenido');
// MODAL-2
const modal2 = document.querySelector('#modal-2');
const m2Codigo = document.querySelector('#m2-codigo');
const m2Nombre = document.querySelector('#m2-nombre');
const m2Agregar = document.querySelector('#m2-agregar');
const m2Cerrar = document.querySelector('#m2-cerrar'); 
const m2Tabla = document.querySelector('#m2-tabla'); 
const m2Tbody = document.querySelector('#m2-tbody'); 
const m2Cod = document.querySelector('#m2-cod');
// MODAL-3
const modal3 = document.querySelector('#modal-3');
const m3Cantidad = document.querySelector('#m3-cantidad');
const m3Guardar = document.querySelector('#m3-guardar');
const m3Cerrar = document.querySelector('#m3-cerrar'); 
//ITEM ESTADO
estadoBueno.addEventListener('change', function() 
{ 
    if(estadoBueno.checked == true)
    {
        boxDefecto.style.display = 'none';
        defecto.selectedIndex = 0;
        codigo.focus();
    }
    else 
    {
        boxDefecto.style.display = 'flex';
    }   
});
estadoDefecto.addEventListener('change', function() 
{ 
    if(estadoDefecto.checked == true)
    {
        defecto.selectedIndex = 0;
        boxDefecto.style.display = 'flex';
        defecto.focus();
    }
    else 
    {
        boxDefecto.style.display = 'none';
    }   
});
defecto.addEventListener('change', function() 
{ 
    codigo.focus();  
});
//BUSCAR ITEM EN LISTA
function itemExiste(codigo)
{
    var filtro = items.filter(items => items.id == codigo);

    if(filtro.length > 0)
    {
        return true;
    }
    else
    {
        return false;              
    }
}
//BUSCAR NOMBRE DE ITEM
function itemNombre(codigo)
{
    var nombre ='';
    var filtro = items.filter(items => items.id == codigo);

    nombre = filtro[0].nombre;        

    return nombre;
}
//CHECK VACIOS
function siguienteFocus()
{
    if(codigo.value == '')
    {
        codigo.focus();
    }
    else if(nombre.value == '')
    {
        nombre.focus();
    }
    else if(cantidad.value == '')
    {
        cantidad.focus();
    }
    else if(estadoDefecto.checked == true && defecto.value == 0)
    {
        defecto.focus();
    }
    else
    {
        botonAgregar.focus();
    }
}
/////////////CODIGO NOMBRE CANTIDAD
codigo.addEventListener('input', function()
{
    if(codigo.value.length < 5)
    {
        nombre.disabled = true;
        nombre.value = '';
        cantidad.value = '';
    }
    if(codigo.value.length > 5)
    {
        codigo.value = codigo.value.substring(0,5);
    } 
    if(codigo.value.length == 5)
    {
        if(itemExiste(codigo.value))
        {
            nombre.value = itemNombre(codigo.value);        
            nombre.disabled = true;   
        }
        else
        {
            nombre.disabled = false;
        }
    } 
});
codigo.addEventListener('keydown', function(e)
{
    var key = e.keyCode; 

    if(key == 13) 
    {
        //tecla enter
        siguienteFocus();
    }
    else if(key == 9) 
    {
        //tecla tab
        e.preventDefault();
        siguienteFocus();
    }
    else if((key >= 48 && key <= 57) || (key >= 96 && key <= 105))
    {
        //numeros: teclado y teclado numerico   
    }    
    else if(key == 37 || key == 39 || key == 8 || key == 46)
    {
        //izquierda, derecha, suprimir, borrar, tab
    }
    else
    {        
        e.preventDefault();
    }
});
//NOMBRE
nombre.addEventListener('keydown', function(e)
{  
    var code = e.keyCode;
    
    if (code == 13) //tecla enter
    {
        if(nombre.value != '') 
        { 
            siguienteFocus();
        }     
    }
});
//CANTIDAD
cantidad.addEventListener('input', function()
{   
    if(cantidad.value.length > 3)
    {
        cantidad.value = cantidad.value.substring(0,3);
    } 
});
cantidad.addEventListener('keydown', function(e)
{
    var key = e.keyCode;
    
    if(key == 13) //tecla enter
    {
        if(cantidad.value != '')
        {
            siguienteFocus();
        }
    }     
    else if((key >= 48 && key <= 57) || (key >= 96 && key <= 105))
    {
        //numeros: teclado y teclado numerico   
    }    
    else if(key == 37 || key == 39 || key == 8 || key == 46 || key == 9)
    {
        //izquierda, derecha, suprimir, borrar, tab
    }
    else
    {
        e.preventDefault();
    }
});

//////////////////////////////////
//SUMAR ITEMS
function sumarItems()
{
    var suma = 0;
    var cantidades = document.querySelectorAll('.cantidad');

    cantidades.forEach(function(e)
    {
        suma = parseInt(e.innerHTML) + suma;            
    });

    total.innerHTML = 'TOTAL PRODUCTOS: '+suma;
}
//LIMPIAR
function limpiarDatos()
{
    estadoBueno.checked = true;
    boxDefecto.style.display = 'none';
    defecto.selectedIndex = 0;    
    codigo.value = '';    
    nombre.disabled = true;
    nombre.value = '';
    cantidad.value = '';
    codigo.focus();    
}

function limpiarTallas() {
  const tipo = tipoInforme.value;
  if (tipo === "1" || tipo === "3") {
    const tallas = document.querySelectorAll('.talla-input');
    tallas.forEach(input => input.value = 0);
  }
}


botonLimpiar.addEventListener('click', function()
{ 
    var filas = tbody.rows.length;  

    if(filas > 0)
    {
        var confirmar = confirm('¿LIMPIAR INFORMACION?');

        if(confirmar == true)
        {
            tbody.innerHTML = '';
            m2Tbody.innerHTML = '';
            sumarItems();
            limpiarDatos();
        }
    }
});
//AGREGAR ITEM
function validarItem(codigo, nombre, cantidad)
{
    var numeroFilas = tbody.rows.length;

    if (numeroFilas > 0)
    {
        var index = -1;
        var duplicado = 0;

        for (var i = 0; i < numeroFilas; i++)
        {
            var codigoFila = tbody.rows[i].cells[0].innerHTML;
            var estadoFila = tbody.rows[i].cells[5].innerHTML;

            if (codigoFila == codigo && estadoFila == '0')
            {
                index = i;
                duplicado++;
            }
        }

        if (duplicado > 0 && index >= 0)
        {
            var celdaCantidad = tbody.rows[index].cells[2];

            // Sumar cantidad total
            var nuevaCantidad = parseInt(celdaCantidad.innerHTML || "0", 10)
                              + parseInt(cantidad || "0", 10);
            celdaCantidad.innerHTML = nuevaCantidad.toString();

            // Sumar tallas
            if (tipoInforme.value === "1" || tipoInforme.value === "3")
            {
                const acumulado = { pp:0, p:0, m:0, g:0, gg:0, egg:0, exgg:0, u:0 };

                const dataPrev = celdaCantidad.getAttribute("data-tallas");
                if (dataPrev)
                {
                    dataPrev.split(", ").forEach(par => {
                        const parts = par.split(": ");
                        const talla = (parts[0] || "").trim().toLowerCase();
                        const valor = parseInt(parts[1] || "0", 10) || 0;
                        if (acumulado.hasOwnProperty(talla)) {
                            acumulado[talla] += valor;
                        }
                    });
                }

                const inputsTalla = document.querySelectorAll('.talla-input');
                inputsTalla.forEach(input => {
                    const val = parseInt(input.value, 10) || 0;
                    const nombreTalla = (input.previousElementSibling?.innerText || "")
                                        .trim().toLowerCase();
                    if (val > 0 && acumulado.hasOwnProperty(nombreTalla)) {
                        acumulado[nombreTalla] += val;
                    }
                });

                const orden = ["pp","p","m","g","gg","egg","exgg","u"];
                const detalle = [];
                orden.forEach(k => {
                    if (acumulado[k] > 0) detalle.push(`${k.toUpperCase()}: ${acumulado[k]}`);
                });

                if (detalle.length > 0) {
                    celdaCantidad.dataset.tallas = detalle.join(", ");
                } else {
                    delete celdaCantidad.dataset.tallas;
                }
            }

            sumarItems();
            limpiarDatos();
            limpiarTallas();
        }
        else
        {
            agregarItem(codigo, nombre, cantidad, '0');
        }
    }
    else
    {
        agregarItem(codigo, nombre, cantidad, '0');
        limpiarTallas();
    }
}

botonAgregar.addEventListener('click', function() {
   if (!exigirDistribuidor()) return;

    // Si es informe 1 (Inventario) o 3 (Recepción), forzamos a calcular cantidad desde tallas
    let cantidadFinal = cantidad.value;

    if (tipoInforme.value === "1" || tipoInforme.value === "3") {
    const tallaInputs = document.querySelectorAll('.talla-input');
    let suma = 0;
    tallaInputs.forEach(input => {
        suma += parseInt(input.value) || 0;
    });
    cantidadFinal = suma;
    cantidad.value = suma;
}

// --- VALIDACIÓN CANTIDAD > 0 (visual y con ubicación correcta) ---
if (parseInt(cantidadFinal, 10) <= 0) {
  mostrarError('La cantidad debe ser mayor a 0');
  return; // aborta el flujo
} else {
  limpiarError(); // por si había un error previo
}


// --- VALIDACIÓN CANTIDAD > 0 ---
if (parseInt(cantidadFinal, 10) <= 0) {
  const divError = document.getElementById('error');
  if (divError) {
    divError.textContent = 'La cantidad debe ser mayor a 0';
    divError.style.color = '#c0392b';
  }
  return; // aborta el flujo de agregar
}


    if(codigo.value !='' && codigo.value.length == 5 && nombre.value !='' && parseInt(cantidadFinal) > 0)


    {
        var nuevoNombre = nombre.value;

        if(nombre.disabled == false)
        {
            nuevoNombre = nuevoNombre+' (*)';
        }
        
        // Si es edición, borramos la fila antes de validar
        if (filaEditando !== null) {
            filaEditando.remove();
            filaEditando = null;
        }
        /*__EDICION_TALLAS__*/
        if (esEdicionTallas === true && (tipoInforme.value === "1" || tipoInforme.value === "3")) {
            esEdicionTallas = false;
            // usamos cantidadFinal ya calculada para tallas
            var nombreParaAgregar = nuevoNombre;
            agregarItem(codigo.value, nombreParaAgregar, cantidadFinal, '0');
            return; // no pasar por validarItem para evitar sumas
        }

        if(estadoDefecto.checked == true)
        {
            if(defecto.value != 0)
            {
                var tipoDefecto = defecto.options[defecto.selectedIndex].text;
                // El nombre queda limpio, sin texto de defecto
                agregarItem(codigo.value, nuevoNombre, cantidad.value, tipoDefecto);
            }
            else
            {
                siguienteFocus();
            }            
        }
        else
        {
            // Estado vacío para productos buenos
            validarItem(codigo.value, nuevoNombre, cantidad.value);
        }
    }
    else
    {
        siguienteFocus();
    } 
});
function agregarItem(codigo, nombre, cantidad, estado)
{

limpiarError();

    var row = tbody.insertRow(0);
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);
    var cell4 = row.insertCell(3);
    var cell5 = row.insertCell(4);
    var cell6 = row.insertCell(5);
    
    cell1.innerHTML = codigo;
    cell1.classList.add('col-1');

    // Formatear nombre: primera letra de cada palabra en mayúscula
let nombreFormateado = nombre.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
cell2.innerHTML = nombreFormateado;
cell2.classList.add('col-2');


    cell3.innerHTML = cantidad;
    cell3.classList.add('col-3');
    cell3.classList.add('cantidad');

// Si es tipo inventario o recepción, guarda los detalles de tallas
if (tipoInforme.value === "1" || tipoInforme.value === "3") {
  const inputsTalla = document.querySelectorAll('.talla-input');
  let detalle = [];

  inputsTalla.forEach(input => {
    const valor = parseInt(input.value);
    const nombreTalla = input.previousElementSibling?.innerText || "";
    if (!isNaN(valor) && valor > 0) {
      detalle.push(`${nombreTalla}: ${valor}`);
    }
  });

  if (detalle.length > 0) {
    cell3.dataset.tallas = detalle.join(", ");
  }
}

    cell4.innerHTML = '<button class="boton-accion" onclick="editarCelda(this)"><i class="far fa-edit"></i></button>';
    cell4.classList.add('col-4');

    cell5.innerHTML = '<button class="boton-accion" onclick="eliminarCelda(this)"><i class="far fa-trash-alt"></i></button>';
    cell5.classList.add('col-5');

    cell6.innerHTML = estado;
    cell6.classList.add('col-6');
    
    sumarItems();
    limpiarDatos();
    limpiarTallas();

}
//ELIMINAR FILA
function eliminarCelda(e)
{       
    var td = e.parentNode; 
    var tr = td.parentNode;
    tr.parentNode.removeChild(tr); 
    sumarItems();
}
//ORDENAR ITEM POR NOMBRE ASCENDENTE
itemEncabezado.addEventListener('click', function() 
{
    var filas = tbody.rows.length;
    
    if(filas > 2)
    {
        sortTable(tabla);
        codigo.focus();
    }   
    else
    {
        codigo.focus();
    } 
});
// MODAL-1
botonBuscar.addEventListener('click', function(e) {
  m1Tbody.innerHTML = '';
  m1Consulta.value = '';

  modal1.classList.add("modal-flotante");
    modal1.classList.add("modal-personalizado");
modal1.style.display = "flex";


  m1Contenido.classList.remove('busqueda-activa'); // reset al abrir
  m1Consulta.focus();
});

m1Cerrar.addEventListener('click', function() 
{ 
    modal1.style.display = 'none';
  
    m1Contenido.classList.remove('busqueda-activa');
    m1Consulta.value = '';
modal1.classList.remove("modal-flotante");

    
    m1Tbody.innerHTML = '';        
    m1Consulta.value = ''; 
});


// Cerrar modal 1 con ESC
document.addEventListener('keydown', (ev) => {
  if (ev.key === 'Escape' && modal1 && modal1.style.display === 'flex') {
    modal1.style.display = 'none';
    if (m1Contenido) m1Contenido.classList.remove('busqueda-activa');
    if (m1Tbody) m1Tbody.innerHTML = '';
    if (m1Consulta) m1Consulta.value = '';
  }
});

m1Buscar.addEventListener('click', function() 
{ 
    m1BuscarItem();  
});
m1Consulta.addEventListener('keydown', function(e)
{  
    var code = e.keyCode;
    
    if (code == 13)
    {
        m1BuscarItem();      
    }
});
function m1BuscarItem()
{    
    m1Tbody.innerHTML = ''; 
    var query = m1Consulta.value.toUpperCase();
    
    if(query.length > 2) 
    {
        var busqueda = items.filter(function(e)
        {
            return e.nombre.toUpperCase().indexOf(query) > -1;
        });
                
        
        busqueda = busqueda.sort(function(a, b) { return a.nombre.localeCompare(b.nombre); });busqueda.forEach(function(e)
        {
            var row = m1Tbody.insertRow(-1);
            var cell1 = row.insertCell(0);
            var cell2 = row.insertCell(1);
            var cell3 = row.insertCell(2);
            cell1.innerHTML = e.id;
            cell2.innerHTML = e.nombre;  
            cell3.innerHTML = '<td><button class="m1-agregar" onclick="m1Agregar(this)"><i class="fas fa-plus"></i></button></td>';
        });
    }
    else
    {
        m1Consulta.focus();
    }
}

function m1BuscarItem() {
  m1Tbody.innerHTML = ''; 
  var query = m1Consulta.value.toUpperCase();

  if(query.length > 2) {
    var busqueda = items.filter(function(e) {
      return e.nombre.toUpperCase().indexOf(query) > -1;
    });

    busqueda.forEach(function(e) {
      var row = m1Tbody.insertRow(-1);
      var cell1 = row.insertCell(0);
      var cell2 = row.insertCell(1);
      var cell3 = row.insertCell(2);
      cell1.innerHTML = e.id;
      cell2.innerHTML = e.nombre;  
      cell3.innerHTML = '<td><button class="m1-agregar" onclick="m1Agregar(this)"><i class="fas fa-plus"></i></button></td>';
    });
  } else {
    m1Consulta.focus();
  }
}


function m1Agregar(e)
{
    var td = e.parentNode; 
    var tr = td.parentNode; 
    var cod = tr.cells[0].innerHTML;   
    codigo.value = cod;   
    nombre.value = itemNombre(cod);        
    nombre.disabled = true;                   
    cantidad.focus();
    modal1.style.display = 'none'; 
}
// MODAL-2
botonBipear.addEventListener('click', function() 
{
    m2Codigo.value = '';
    m2Nombre.value = '';
    modal2.style.display = 'flex';
    m2Codigo.focus(); 
});
m2Cerrar.addEventListener('click', function() 
{ 
    modal2.style.display = 'none';       
    m2Codigo.value = ''; 
    m2Nombre.value = '';
    codigo.focus();
});
m2Agregar.addEventListener('click', function() 
{ 
    if(m2Codigo.value.length == 5 || m2Nombre.value != '')
    {
        m2BuscarItem();          
    }  
    else
    {
        m2Codigo.focus();
    }   
});
function m2AgregarItem(codigo, nombre, cantidad)
{
    var row = m2Tbody.insertRow(0);
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);
    
    cell1.innerHTML = codigo;
    cell2.innerHTML = nombre;
    cell3.innerHTML = cantidad;

    validarItem(codigo, nombre, cantidad);
    m2Codigo.value = '';
    m2Nombre.value = '';
    m2Codigo.focus();
}
function m2BuscarItem()
{
    if(itemExiste(m2Codigo.value))
    {
        m2Nombre.value = itemNombre(m2Codigo.value);                   
        m2AgregarItem(m2Codigo.value, m2Nombre.value, '1');
    }
    else
    {
        m2Codigo.value='';
        m2Nombre.value='';
        alert('ERROR LECTURA CODIGO');
        m2Codigo.focus();
    }
}
m2Codigo.addEventListener('input', function()
{
    if(m2Codigo.value.length < 5)
    {
        m2Nombre.value = '';
    }
    if(m2Codigo.value.length > 5)
    {
        m2Codigo.value = m2Codigo.value.substring(0,5);
    } 
});
m2Codigo.addEventListener('keydown', function(e)
{    
    var key = e.keyCode; 

    if(key == 13) 
    {
        //tecla enter
        m2BuscarItem();
    }
    else if(key == 9) 
    {
        //tecla tab
        e.preventDefault();
        m2BuscarItem();
    }
    else if((key >= 48 && key <= 57) || (key >= 96 && key <= 105))
    {
        //numeros: teclado y teclado numerico   
    }    
    else if(key == 37 || key == 39 || key == 8 || key == 46)
    {
        //izquierda, derecha, suprimir, borrar, tab
    }
    else
    {        
        e.preventDefault();
    }
});
// MODAL-3
var m3Tr;
var esEdicionTallas = false;

function editarCelda(e) {
  const td = e.parentNode;
  const tr = td.parentNode;

  // Celdas base
  const celdaCodigo   = tr.cells[0];
  const celdaNombre   = tr.cells[1];
  const celdaCantidad = tr.cells[2];
  const celdaEstado   = tr.cells[5];

  // Tipo de informe actual: 1=Inventario, 2=Devolución, 3=Recepción
  const tipo = (tipoInforme && tipoInforme.value) || "2";

  // --- INVENTARIO / RECEPCIÓN: prefill arriba + tallas, NO modal 3 ---
  if (tipo === "1" || tipo === "3") {
    // Rellenar código y nombre arriba
    if (typeof codigo !== 'undefined' && codigo)   codigo.value   = celdaCodigo.innerText.trim();
    if (typeof nombre !== 'undefined' && nombre) { nombre.disabled = true; nombre.value = celdaNombre.innerText.trim(); }

    // Repartir tallas desde data-tallas; si no hay, poner 0
    const valores = { pp:0, p:0, m:0, g:0, gg:0, egg:0, exgg:0, u:0 };
    const data = celdaCantidad.getAttribute ? celdaCantidad.getAttribute("data-tallas") : null;
    if (data) {
      data.split(", ").forEach(par => {
        const [talla, valor] = par.split(": ");
        const id = (talla || "").trim().toLowerCase();
        if (Object.prototype.hasOwnProperty.call(valores, id)) valores[id] = parseInt(valor || "0", 10) || 0;
      });
    }
    Object.entries(valores).forEach(([key, val]) => {
      const input = document.getElementById(`talla-${key}`);
      if (input) input.value = val;
    });

    // Marcar fila para que "Agregar" ACTUALICE y no duplique/sume
    filaEditando = tr;
    esEdicionTallas = true;

    // Foco a la primera talla
    const primero = document.getElementById('talla-pp') || document.getElementById('talla-p') || document.getElementById('talla-m');
    if (primero && primero.focus) { try { primero.focus(); } catch(e){} }

    // NO abrir modal 3 en 1/3
    return;
  }

  // --- DEVOLUCIÓN (2) o filas sin tallas: editar solo cantidad en Modal 3 ---
  // ⚠️ NO tocamos los campos superiores (codigo/nombre/cantidad/estado)
  filaEditando = null;            // evitar que "Agregar" cree duplicados
  esEdicionTallas = false;
  m3Tr = tr;
  m3Cantidad.value = tr.cells[2].innerText.trim();
  modal3.classList.add('mostrar');
  modal3.style.display = 'flex';
  m3Cantidad.focus();
}



// La X guarda igual que el botón Guardar
m3Cerrar.addEventListener('click', function () {
  actulizarCantidad();
});

m3Guardar.addEventListener('click', function() 
{ 
    actulizarCantidad();
});

// Cerrar Modal 3 con ESC guardando la cantidad
document.addEventListener('keydown', function (ev) {
  if (ev.key !== 'Escape') return;
  // Sólo si Modal 3 está visible
  if (modal3 && window.getComputedStyle(modal3).display === 'flex') {
    actulizarCantidad();
  }
}, true);

m3Cantidad.addEventListener('keydown', function(e)
{  
    var code = e.keyCode;
    
    if (code == 13)
    {
        actulizarCantidad();      
    }
});
function actulizarCantidad()
{
    m3Tr.cells[2].innerHTML = m3Cantidad.value;
    sumarItems();

    modal3.classList.remove('mostrar');
    modal3.style.display = 'none';
    m3Cantidad.value = '';
    m3Tr = '';
}
////////////////////////////////////////////////////////
//ORDENAR ITEM TABLA POR ABCEDARIO
function sortTable(nombreTabla)
{
    var table, rows, switching, i, x, y, shouldSwitch;
    table = nombreTabla;
    switching = true;
    /* Make a loop that will continue until
    no switching has been done: */
    while (switching)
    {
      // Start by saying: no switching is done:
      switching = false;
      rows = table.rows;
      /* Loop through all table rows (except the
      first, which contains table headers): */
      for(i = 1; i < (rows.length - 1); i++)
      {
        // Start by saying there should be no switching:
        shouldSwitch = false;
        /* Get the two elements you want to compare,
        one from current row and one from the next: */
        x = rows[i].getElementsByTagName("td")[1];
        y = rows[i + 1].getElementsByTagName("td")[1];
        // Check if the two rows should switch place:
        if(x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase())
        {
          // If so, mark as a switch and break the loop:
          shouldSwitch = true;
          break;
        }
      }
      if(shouldSwitch)
      {
        /* If a switch has been marked, make the switch
        and mark that a switch has been done: */
        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
        switching = true;
      }
    }
}
//CREAR PDF
botonCrear.addEventListener('click', function() 
{ 
    //crearPDF(); 
    crearXLS();
});


function crearXLS() 
{
    sortTable(tabla);
    var table = document.getElementById('tbody');
    var rows = table.getElementsByTagName('tr');
    
    var data = [];
    
    var titulo = [];
    titulo.push('codigo');
    titulo.push('nombre');
    titulo.push('cantidad');
    data.push(titulo);

    for (var i = 0; i < rows.length; i++) {
      var rowData = [];
      var cells = rows[i].getElementsByTagName('td');
      
      rowData.push(cells[0].innerText.toLowerCase()); // Columna 1
      rowData.push(cells[1].innerText.toLowerCase()); // Columna 2
      rowData.push(cells[2].innerText.toLowerCase()); // Columna 3
      
      data.push(rowData);
    }   

    var wb = XLSX.utils.book_new();
    var ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet 1');
    
    var wbout = XLSX.write(wb, {bookType: 'xlsx', type: 'binary'});
    
    function s2ab(s) {
      var buf = new ArrayBuffer(s.length);
      var view = new Uint8Array(buf);
      for (var i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
      return buf;
    }
    
    saveAs(new Blob([s2ab(wbout)], {type: 'application/octet-stream'}), 'tabla.xlsx');
}
function crearPDF()
{
    var textoTipoInforme = tipoInforme.options[tipoInforme.selectedIndex].text;
    var textoDistribuidor = distribuidor.options[distribuidor.selectedIndex].text;

    tituloInforme.innerHTML = 'informe de '+textoTipoInforme;                       
    tituloDistribuidor.innerHTML = 'distribuidor: '+textoDistribuidor;            
    var fecha = new Date();

    tituloFecha.innerHTML = 'creado: '+fecha.toLocaleDateString()+' '+fecha.toLocaleTimeString();  

// ——— MODO COMPACTO SOLO DURANTE LA EXPORTACIÓN ———
pdf.classList.add('pdf-compact');
document.body.classList.add('pdf-full');


// Landscape cuando hay tallas (Inventario=1, Recepción=3)
const esTallas = (tipoInforme.value === "1" || tipoInforme.value === "3");
// === (1) MÁRGENES BASE PARA PDF (según tallas) ===
const bottomMargin = esTallas ? 14 : 16; // si luego quieres 16/18, cambia aquí
const PDF_MARGIN_TALLAS = [8, 6, bottomMargin, 6];
const PDF_MARGIN_NORMAL = [12, 10, bottomMargin, 10];



    var filas = tbody.rows.length;
    
    if(filas > 0)
    {
        if(tipoInforme.value != 0  && distribuidor.value != 0 && distribuidor.value != 99)
        {   
            var element = pdf;            
            var nombrePDF = textoTipoInforme.substring(0,3).toUpperCase()+'-'+textoSemana+'-'+textoDistribuidor.toUpperCase();
const ZEBRA_PINK = '#faeaf1'; // el rosita de tus filas

const opt = {
  // [top, right, bottom, left] en milímetros
  margin: esTallas ? PDF_MARGIN_TALLAS : PDF_MARGIN_NORMAL,
  filename: buildPdfFilename(),
  image: { type: 'jpeg', quality: 0.98 },

  html2canvas: {
    scale: 3,
    useCORS: true,
    backgroundColor: '#ffffff',

    // 👇 CLAVE: pintamos zebra en el DOM CLONADO que html2canvas realmente captura
    onclone: (clonedDoc) => {
      const tabla = clonedDoc.querySelector('#pdf table');
      if (!tabla) return;

      const filas = tabla.querySelectorAll('tbody tr');
      filas.forEach((fila, i) => {
        fila.style.backgroundColor = (i % 2 === 0) ? '#ffffff' : ZEBRA_PINK;
      });
    }
  },

jsPDF: { unit: 'mm', format: esTallas ? 'letter' : 'a4', orientation: esTallas ? 'landscape' : 'portrait' },
  pagebreak: { mode: ['css','legacy'] }
};

          
            sortTable(tabla);
            ocultarColumna('none', 'block');

            html2pdf().set(opt).from(element).save().then(function(){
            pdf.classList.remove('pdf-compact');
            document.body.classList.remove('pdf-full');
            ocultarColumna('', 'none');                
            codigo.focus();
            });
        }
        else
        {
            if(tipoInforme.value == 0) 
            { 
                tipoInforme.focus(); 
            }
            
            else if(distribuidor.value == 0 || distribuidor.value == 99) 
            { 
                distribuidor.focus(); 
            }
            else 
            {
                //...
            }
        }
    }
    else
    {
        codigo.focus();
    }  
}
function ocultarColumna(displayColumna, displayEncabezado)
{
    var col4 = document.getElementsByClassName('col-4');
    var col5 = document.getElementsByClassName('col-5');
    
    for (var i = 0; i < col4.length; i++) 
    {
        col4[i].style.display = displayColumna;
        col5[i].style.display = displayColumna;
    }    

    pdfEncabezado.style.display = displayEncabezado;
}

  // Ajuste defensiv


// Mostrar u ocultar el campo ITEM ESTADO y TIPO DE DEFECTO según tipo de informe
document.getElementById("tipo-informe").addEventListener("change", function () {
  const tipo = this.value;
  const boxEstado = document.getElementById("box-estado");
  const boxDefecto = document.getElementById("box-defecto");
  const defectoRadio = document.getElementById("estado-defecto");

  if (tipo === "2") {
    boxEstado.parentElement.style.display = "block";

    if (defectoRadio.checked) {
      boxDefecto.style.display = "flex";
    } else {
      boxDefecto.style.display = "none";
    }
  } else {
    boxEstado.parentElement.style.display = "none";
    boxDefecto.style.display = "none";
  }
});


function activarEventosTallaInputs() {
  const tallaInputs = document.querySelectorAll('.talla-input');

  tallaInputs.forEach(input => {
    input.addEventListener('focus', function () {
      if (this.value === "0") {
        this.value = "";
      }
    });

    input.addEventListener('blur', function () {
      if (this.value === "") {
        this.value = "0";
      }
    });
  });
}

function actualizarCamposPorTipo() {
// Mostramos el contenido principal al seleccionar un tipo de informe
document.getElementById("formulario-completo").style.display = "block";

  const tipo = tipoInforme.value;
  const bloqueTallas = document.getElementById("bloque-tallas");
  const bloqueCantidad = document.getElementById("bloque-cantidad");
  const boxEstado = document.getElementById("box-estado");
  const boxDefecto = document.getElementById("box-defecto");
  const defectoRadio = document.getElementById("estado-defecto");

  if (tipo === "1" || tipo === "3") {
    bloqueTallas.style.display = "grid";
    bloqueCantidad.style.display = "none";
    boxEstado.parentElement.style.display = "none";
    boxDefecto.style.display = "none";
  } else if (tipo === "2") {
    bloqueTallas.style.display = "none";
    bloqueCantidad.style.display = "block";
    boxEstado.parentElement.style.display = "flex";
    boxDefecto.style.display = defectoRadio.checked ? "flex" : "none";
  } else {
    bloqueTallas.style.display = "none";
    bloqueCantidad.style.display = "none";
    boxEstado.parentElement.style.display = "none";
    boxDefecto.style.display = "none";
  }

  // === Mostrar/Ocultar BIPEO (Modal 2) según tipo ===
  (function(){
    // Buscar botón "bipear" por id conocido o por texto
    var btnBipear = document.getElementById('boton-bipear');
    if (!btnBipear) {
      var allBtns = document.querySelectorAll('button, .btn');
      for (var i=0;i<allBtns.length;i++){
        var t = (allBtns[i].textContent||'').trim().toLowerCase();
        if (t === 'bipear') { btnBipear = allBtns[i]; break; }
      }
    }
    var modal2 = document.getElementById('modal-2');
    if (btnBipear){
      if (tipo === "2") { // Devolución
        btnBipear.style.display = 'inline-block';
      } else {           // Inventario o Recepción
        btnBipear.style.display = 'none';
        if (modal2) modal2.style.display = 'none';
      }
    }
  })();

}

// Evento que se dispara al cambiar el tipo de informe
tipoInforme.addEventListener("change", actualizarCamposPorTipo);

// Cuando el HTML termina de cargar
document.addEventListener('DOMContentLoaded', function () {
  const tipoInforme = document.getElementById('tipo-informe');
  const formularioCompleto = document.getElementById('formulario-completo');

  // Oculta todo el bloque al cargar
  formularioCompleto.style.display = 'none';

  // Muestra el formulario si el tipo de informe es válido
  tipoInforme.addEventListener('change', function () {
    if (this.value !== "0") {
      formularioCompleto.style.display = "block";
      actualizarCamposPorTipo(); // Ejecuta la lógica que ya tienes

        limpiarDatos();
        limpiarTallas();
        tbody.innerHTML = '';
        m2Tbody.innerHTML = '';
        sumarItems();


const mensajeBienvenida = document.getElementById("mensaje-bienvenida");
if (mensajeBienvenida) {
  mensajeBienvenida.style.display = "none";
}

document.body.classList.remove("bienvenida-activa");
document.body.classList.add("contenido-activo");

    } else {
      formularioCompleto.style.display = "none";
    }
  });activarEventosTallaInputs();

  document.body.classList.add("bienvenida-activa");
});



// ESCUCHA GLOBAL PARA INPUTS DE TALLA
document.addEventListener('focusin', function (e) {
  if (e.target.classList.contains('talla-input')) {
    if (e.target.value === "0") {
      e.target.value = "";
    }
  }
});

document.addEventListener('focusout', function (e) {
  if (e.target.classList.contains('talla-input')) {
    if (e.target.value === "") {
      e.target.value = "0";
    }
  }
});

// === TOOLTIP DE TALLAS (horizontal, estilo chips) ===
document.querySelector("#tabla tbody").addEventListener("click", function (e) {
  const celda = e.target.closest("td.cantidad");
  if (!celda || !celda.dataset.tallas) return;

  // Cerrar tooltips anteriores
  document.querySelectorAll(".tallas-tooltip").forEach(t => t.remove());

  // Crear tooltip y lista de chips
  const tooltip = document.createElement("div");
  tooltip.className = "tallas-tooltip";

  const lista = document.createElement("div");
  lista.className = "tallas-tooltip__list";

  celda.dataset.tallas.split(",").map(s => s.trim()).forEach(par => {
    if (!par) return;
    const [talla, cant] = par.split(":").map(x => (x || "").trim());
    const chip = document.createElement("span");
    chip.className = "tallas-chip";
    chip.innerHTML = `<strong>${talla}</strong> ${cant}`;
    lista.appendChild(chip);
  });

  tooltip.appendChild(lista);

  // Posicionar debajo de la celda
  const r = celda.getBoundingClientRect();
  tooltip.style.top = `${window.scrollY + r.bottom + 8}px`;
  tooltip.style.left = `${window.scrollX + r.left + r.width / 2}px`;
  tooltip.style.transform = 'translateX(-50%)';


  document.body.appendChild(tooltip);
  tooltip.addEventListener("click", () => tooltip.remove());
  setTimeout(() => tooltip.remove(), 7000);
});




// === BOTÓN PDF con detección flexible ===
(function(){
  let btnPdf = document.querySelector('#boton-pdf') || document.querySelector('#boton-crear-pdf');
  if (!btnPdf) {
    const candidatos = Array.from(document.querySelectorAll('button'));
    btnPdf = candidatos.find(b => (b.textContent || '').trim().toLowerCase() === 'crear pdf');
  }
  if (btnPdf) {
    btnPdf.addEventListener('click', function () {
      if (!tbody || tbody.rows.length === 0) { codigo && codigo.focus(); return; }
      exportarPDFConTallasSiCorresponde();
    });
  }
})();

function buildPdfFilename() {
  // Abreviatura por tipo (1=Inventario, 2=Devolución, 3=Recepción)
  const tipoEl = document.getElementById('tipo-informe');
  const tipoVal = tipoEl ? String(tipoEl.value) : '';
  const abbrMap = { '1': 'Inv', '2': 'Dev', '3': 'Rec' };
  const abbr = abbrMap[tipoVal] || 'Doc';

  // Nombre distribuidor (primer nombre + primer apellido)
  const distEl = document.getElementById('distribuidor');
  const full = (distEl?.selectedOptions?.[0]?.text || distEl?.value || '').trim();
  let firstName = 'NN', firstSurname = '';
  if (full) {
    const t = full.split(/\s+/).filter(Boolean);
    if (t.length >= 2) {
      firstName = t[0];
      firstSurname = t.length >= 3 ? t[t.length - 2] : t[1]; // penúltimo si hay 2 apellidos
    } else {
      firstName = t[0];
    }
  }

  // Fecha dd-mm-yy
  const d = new Date();
  const dd = String(d.getDate()).padStart(2,'0');
  const mm = String(d.getMonth()+1).padStart(2,'0');
  const yy = String(d.getFullYear()).slice(-2);

  // Sanitizar para nombre de archivo (sin acentos ni caracteres inválidos)
  const sanitize = s => s
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[\/\\:*?"<>|]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const nombreDist = firstSurname ? `${firstName} ${firstSurname}` : firstName;

  return `${abbr}-${sanitize(nombreDist)}-${dd}-${mm}-${yy}.pdf`;
}


function exportarPDFConTallasSiCorresponde() {
// Bloquea exportación si no hay distribuidora
if (!exigirDistribuidor()) { return; }

  
  // —— Anti-corte fila/celda para PDF ——
  function aplicarAntiCorte(el) {
    try {
      el.style.breakInside = 'avoid';
      el.style.pageBreakInside = 'avoid';
      el.style.webkitColumnBreakInside = 'avoid';
    } catch(e) {}
  }
try {
    // Construye encabezado
    const textoTipo = (tipoInforme && tipoInforme.selectedIndex > -1) ? tipoInforme.options[tipoInforme.selectedIndex].text : '';
    const textoDistrib = (distribuidor && distribuidor.selectedIndex > -1) ? distribuidor.options[distribuidor.selectedIndex].text : 'Seleccione un distribuidor';
    const fecha = new Date();
    if (tituloInforme) tituloInforme.innerHTML = 'informe de ' + textoTipo;
    if (tituloDistribuidor) tituloDistribuidor.innerHTML = 'distribuidor: ' + textoDistrib;
    if (tituloFecha) tituloFecha.innerHTML = 'creado: ' + fecha.toLocaleDateString() + ' ' + fecha.toLocaleTimeString();

    // Ordena y oculta acciones
    sortTable(tabla);
    ocultarColumna('none', 'block');

    const esInventario = (tipoInforme && (tipoInforme.value === "1" || tipoInforme.value === "3"));

    
let elementoAExportar = pdf;

// Usamos el valor actual del selector sin dudas de variable
const tipoVal = (tipoInforme && tipoInforme.value) ? String(tipoInforme.value) : "0";

let contenedorTemporal = null;

if (tipoVal === "1" || tipoVal === "3") {
  // ===== INVENTARIO / RECEPCIÓN (con tallas) =====
  contenedorTemporal = document.createElement('div');
  contenedorTemporal.classList.add('pdf-font');
  contenedorTemporal.style.padding = '10px 0';

  // Clonamos encabezado ya rellenado
  const encabezadoClone = pdfEncabezado.cloneNode(true);
  contenedorTemporal.appendChild(encabezadoClone);

  encabezadoClone.style.textAlign = 'center';
  encabezadoClone.style.marginBottom = '60px';
  encabezadoClone.style.fontFamily = "'Segoe UI', sans-serif";

  // === (3) ANTI-CORTE ENCABEZADO ===
  encabezadoClone.style.pageBreakInside = 'avoid';
  encabezadoClone.style.pageBreakAfter  = 'avoid';

// --- H1 / DISTRIBUIDOR / FECHA (Inventario / Recepción)
const h1 = encabezadoClone.querySelector('#titulo-informe');
if (h1) {
  h1.style.fontSize = '32px';
  h1.style.fontWeight = '700';
  h1.style.textTransform = 'capitalize';
  h1.style.margin = '0 0 8px 0';
  h1.style.color = '#ad1457'; // rosado del sitio
}

const d = encabezadoClone.querySelector('#titulo-distribuidor');
if (d) {
  d.style.fontSize = '18px';
  d.style.fontWeight = '600';
  d.style.color = '#555';
  d.style.textTransform = 'capitalize';
  d.style.margin = '0 0 4px 0';
}

const f = encabezadoClone.querySelector('#titulo-fecha');
if (f) {
  f.style.fontSize = '16px';
  f.style.fontStyle = 'italic';
  f.style.color = '#777';
  f.style.textTransform = 'capitalize';
  f.style.margin = '0';
}

  const tablaWrap = document.createElement('div');
  tablaWrap.id = 'tabla-pdf-tallas';

  const tablaNueva = document.createElement('table');
  tablaNueva.style.fontSize = '12px'; // Ajusta según el tamaño que quieras, // igual que Inventario/Recepción
  // ancho fijo y distribución estable
  tablaNueva.style.width = '100%';
  tablaNueva.style.tableLayout = 'fixed';

  const thead = document.createElement('thead');
  const trh = document.createElement('tr');
  const headers = ['CÓDIGO','PRODUCTO','CANTIDAD','PP','P','M','G','GG','EGG','EXGG','U'];
  headers.forEach(h => {
  const th = document.createElement('th');
  th.textContent = h;

  // === Encabezado rosado como en pantalla ===
  th.style.padding = '6px 10px';
  th.style.fontWeight = '700';
  th.style.textTransform = 'uppercase';
  th.style.backgroundColor = '#fce4ec';  // fondo rosado modal
  th.style.color = '#ad1457';            // texto rosado oscuro
  th.style.borderColor = '#f8bbd0';      // mismo borde que el modal
  th.style.borderBottom = '2px solid #f8bbd0';

  trh.appendChild(th);
});

thead.appendChild(trh);
tablaNueva.appendChild(thead);


  // Anchos proporcionales para que quepa todo
  (function(){
    const ths = trh.querySelectorAll('th');
    if (ths[0]) ths[0].style.width = '12%'; // CODIGO
    if (ths[1]) ths[1].style.width = '32%'; // ITEM
    if (ths[2]) ths[2].style.width = '8%';  // CANTIDAD
    const tallasIdx = [3,4,5,6,7,8,9,10];
    tallasIdx.forEach(i => { if (ths[i]) ths[i].style.width = '6%'; });
  })();

  const tb = document.createElement('tbody');
  const mapKey = { 'PP':'pp','P':'p','M':'m','G':'g','GG':'gg','EGG':'egg','EXGG':'exgg','U':'u' };

  for (let i=0; i<tbody.rows.length; i++) {
    const r = tbody.rows[i];
    const code = r.cells[0].innerText.trim();
    let name = r.cells[1].innerText.trim();
    name = name.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());

    const qty = r.cells[2].innerText.trim();

    const sizes = { pp:'', p:'', m:'', g:'', gg:'', egg:'', exgg:'', u:'' };

const dataset = r.cells[2].dataset.tallas;
if (dataset) {
  const pares = dataset.split(',');
  pares.forEach(par => {
    const [tallaRaw, valorRaw] = par.split(':');
    if (!tallaRaw || !valorRaw) return;

    const talla = tallaRaw.trim().toUpperCase();
    const valor = parseInt(valorRaw.trim(), 10);

    const key = mapKey[talla];
    if (key && !isNaN(valor) && valor > 0) {
      sizes[key] = valor.toString();
    }
  });
}

    const divTrWrapper = document.createElement('div');
divTrWrapper.style.breakInside = 'avoid';
divTrWrapper.style.pageBreakInside = 'avoid';
const tr = document.createElement('tr');
    aplicarAntiCorte(tr);

    // --- EFECTO ZEBRA INVENTARIO ---
    if (i % 2 !== 0) {
        tr.style.backgroundColor = '#fdebf3'; // Color Rosado
    } else {
        tr.style.backgroundColor = '#ffffff'; // Color Blanco
    }
    
    const celdas = [code, name, qty, sizes.pp, sizes.p, sizes.m, sizes.g, sizes.gg, sizes.egg, sizes.exgg, sizes.u];
    celdas.forEach((val, idx) => {
  const td = document.createElement('td');
  // Si es una talla (idx >= 3) y viene 0, mostrar vacío en el PDF
if (idx >= 3 && (val === 0 || val === "0")) {
  td.textContent = '';
} else {
  td.textContent = (val === undefined || val === null) ? '' : String(val);
}

  aplicarAntiCorte(td);

  if (idx === 1) {
  td.style.textAlign = 'left';
  td.style.fontWeight = 'normal'; // sin negrita
  td.style.wordBreak = 'break-word';
} else if (idx === 0 || idx === 2 || idx >= 3) {
  td.style.textAlign = 'center';
}


  tr.appendChild(td);
});

    tb.appendChild(tr);
  }

  tablaNueva.appendChild(tb);
  tablaWrap.appendChild(tablaNueva);
  contenedorTemporal.appendChild(tablaWrap);
// Aplica fuente Arial a la tabla generada en Devolución
tablaWrap.style.fontFamily = 'Arial, sans-serif';


  const totalClone = document.getElementById('total').cloneNode(true);
  contenedorTemporal.appendChild(totalClone);

  elementoAExportar = contenedorTemporal;

} else {
  // ===== DEVOLUCIÓN (sin tallas) =====
  contenedorTemporal = document.createElement('div');
  contenedorTemporal.style.padding = '10px 0';

  const encabezadoClone = pdfEncabezado.cloneNode(true);
  contenedorTemporal.appendChild(encabezadoClone);

  encabezadoClone.style.textAlign = 'center';
  encabezadoClone.style.marginBottom = '70px'; // aire extra

 
  // === (3) ANTI-CORTE ENCABEZADO ===
  encabezadoClone.style.pageBreakInside = 'avoid';
  encabezadoClone.style.pageBreakAfter  = 'avoid';
  encabezadoClone.style.fontFamily = "'Segoe UI', sans-serif";

  // --- H1 / DISTRIBUIDOR / FECHA (Devolución)
const h1 = encabezadoClone.querySelector('#titulo-informe');
if (h1) {
  h1.style.fontSize = '32px';
  h1.style.fontWeight = '700';
  h1.style.textTransform = 'capitalize';
  h1.style.margin = '0 0 8px 0';
  h1.style.color = '#ad1457'; // rosado del sitio
}

const d = encabezadoClone.querySelector('#titulo-distribuidor');
if (d) {
  d.style.fontSize = '18px';
  d.style.fontWeight = '600';
  d.style.color = '#555';
  d.style.textTransform = 'capitalize';
  d.style.margin = '0 0 4px 0';
}

const f = encabezadoClone.querySelector('#titulo-fecha');
if (f) {
  f.style.fontSize = '16px';
  f.style.fontStyle = 'italic';
  f.style.color = '#777';
  f.style.textTransform = 'capitalize';
  f.style.margin = '0';
}



  const tablaWrap = document.createElement('div');
  const tablaNueva = document.createElement('table');
  tablaNueva.style.fontSize = '12px';  // ← NUEVO (tamaño de letra más pequeño)
  tablaNueva.style.width = '100%';
  tablaNueva.style.tableLayout = 'fixed';

  const thead = document.createElement('thead');
const trh = document.createElement('tr');

['CÓDIGO','PRODUCTO','CANTIDAD'].forEach(h => {
  const th = document.createElement('th');
  th.textContent = h;

  // === Encabezado rosado como en pantalla ===
  th.style.padding = '6px 10px';
  th.style.fontWeight = '700';
  th.style.textTransform = 'uppercase';
  th.style.backgroundColor = '#fce4ec';  // fondo rosado
  th.style.color = '#ad1457';            // texto rosado oscuro
  th.style.borderColor = '#f8bbd0';      // mismo tono de borde
  th.style.borderBottom = '2px solid #f8bbd0';

  trh.appendChild(th);
});

thead.appendChild(trh);
tablaNueva.appendChild(thead);


  (function(){
    const ths = trh.querySelectorAll('th');
    if (ths[0]) ths[0].style.width = '20%';
    if (ths[1]) ths[1].style.width = '60%';
    if (ths[2]) ths[2].style.width = '20%';
  })();

  const tb = document.createElement('tbody');
  for (let i = 0; i < tbody.rows.length; i++) {
    const r = tbody.rows[i];
    const code   = r.cells[0].innerText.trim();
    // Nombre limpio SIN la etiqueta visual "(motivo)" que está en .estado-tag
const tdProducto = r.cells[1];
const tagMotivo  = tdProducto.querySelector('.estado-tag');
let name = tdProducto.innerText.trim();
if (tagMotivo) {
  name = name.replace(tagMotivo.textContent, '').trim();
}

  // Convierte a minúsculas y luego capitaliza cada palabra
  name = name.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());

    const qty    = r.cells[2].innerText.trim();
    const estado = (r.cells[5]?.innerText || '').trim();

// Evitar duplicado: si el nombre YA termina con (estado), no volver a añadirlo
const paren = name.match(/\(([^)]+)\)\s*$/);                // toma el último (…) al final del nombre
const estadoNorm = estado.toLowerCase();
const yaTrae = paren && paren[1].trim().toLowerCase() === estadoNorm;

if (estado && estado !== '0' && !yaTrae) {
  name = `${name} (${estado})`;
}


    const tr = document.createElement('tr');
    aplicarAntiCorte(tr);

// --- EFECTO ZEBRA DEVOLUCIÓN ---
    if (i % 2 !== 0) {
        tr.style.backgroundColor = '#fdebf3'; // Color Rosado
    } else {
        tr.style.backgroundColor = '#ffffff'; // Color Blanco
    }
    
// --- celdas de la fila (Devolución) ---
const td1 = document.createElement('td');
aplicarAntiCorte(td1);
td1.textContent = code;
td1.style.textAlign = 'center';
td1.style.padding = '6px 10px';
td1.style.lineHeight = '1.2';
tr.appendChild(td1);

const td2 = document.createElement('td');
aplicarAntiCorte(td2);
td2.style.wordBreak = 'break-word';
td2.style.textAlign = 'left';  // ← PRODUCTO a la izquierda

if (name.includes('(')) {
  const producto = name.substring(0, name.indexOf('(')).trim();
  const defectoTxt = name.substring(name.indexOf('(')).trim(); // incluye los paréntesis
  td2.innerHTML = producto + ' <strong>' + defectoTxt + '</strong>';
} else {
  td2.textContent = name;
}
td2.style.padding = '6px 10px';
td2.style.lineHeight = '1.2';
tr.appendChild(td2);

const td3 = document.createElement('td');
aplicarAntiCorte(td3);
td3.textContent = qty;
td3.style.textAlign = 'center';
td3.style.padding = '6px 10px';
td3.style.lineHeight = '1.2';
tr.appendChild(td3);

    tb.appendChild(tr);
  }

  tablaNueva.appendChild(tb);
  tablaWrap.appendChild(tablaNueva);
  contenedorTemporal.appendChild(tablaWrap);

  const totalClone = document.getElementById('total').cloneNode(true);
  contenedorTemporal.appendChild(totalClone);

  elementoAExportar = contenedorTemporal;
}
const esTallas = (tipoInforme && (tipoInforme.value === "1" || tipoInforme.value === "3"));

// margen inferior reservado para el pie de página
const bottomMargin = esTallas ? 14 : 16; // antes 8/12

const opt = {
  // [top, right, bottom, left] en milímetros
  margin: esTallas ? [8, 6, bottomMargin, 6] : [12, 10, bottomMargin, 10],
  filename: buildPdfFilename(),
  image: { type: 'jpeg', quality: 0.98 },
  html2canvas: { scale: 3 },
jsPDF: { unit: 'mm', format: esTallas ? 'letter' : 'a4', orientation: esTallas ? 'landscape' : 'portrait' },
    pagebreak: { mode: ['css', 'legacy'] }

};


    if (typeof html2pdf === 'undefined') {
      alert('Falta la librería html2pdf.bundle.min.js en el HTML.');
      ocultarColumna('', 'none');
      return;
    }

    html2pdf().set(opt).from(elementoAExportar).toPdf().get('pdf').then(function (pdf) {
      const totalPages = pdf.internal.getNumberOfPages();
const pageWidth  = pdf.internal.pageSize.getWidth();
const pageHeight = pdf.internal.pageSize.getHeight();
// Ubicamos el pie dentro del margen reservado en el Paso 1
const footerY = pageHeight - (bottomMargin / 2);

for (let i = 1; i <= totalPages; i++) {
  pdf.setPage(i);

  // 1) Limpia/“pinta de blanco” el margen inferior por si alguna línea se asomó
  pdf.setFillColor(255, 255, 255);
  pdf.rect(0, pageHeight - bottomMargin, pageWidth, bottomMargin, 'F');

  // 2) Dibuja el texto del pie centrado
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");
  const footerText = "Página " + i + " de " + totalPages;
  const textWidth = pdf.getTextWidth(footerText);
  const x = (pageWidth - textWidth) / 2;
  pdf.setTextColor(0, 0, 0);
  pdf.text(footerText, x, footerY);
}

    }).save().then(function(){
      // Restaurar
      ocultarColumna('', 'none');
    }).finally(function(){
      // Limpieza de temporal
      if (contenedorTemporal && contenedorTemporal.parentNode) {
        contenedorTemporal.parentNode.removeChild(contenedorTemporal);
      }
    });
  } catch (err) {
    console.error('Error al crear PDF:', err);
    ocultarColumna('', 'none');
  }
}

function m1BuscarItem()
{    
    m1Tbody.innerHTML = ''; 
    var query = m1Consulta.value.toUpperCase();
    
    if(query.length > 2) 
    {
        var busqueda = items.filter(function(e)
        {
            return e.nombre.toUpperCase().indexOf(query) > -1;
        });
        
        // Orden A→Z
        busqueda = busqueda.sort(function(a, b) { 
            return a.nombre.localeCompare(b.nombre); 
        });
        
        // Pintar filas respetando el orden (append)
        busqueda.forEach(function(e)
        {
            var row = m1Tbody.insertRow(-1);
            var cell1 = row.insertCell(0);
            var cell2 = row.insertCell(1);
            var cell3 = row.insertCell(2);
            cell1.innerHTML = e.id;
            cell2.innerHTML = e.nombre;  
            cell3.innerHTML = '<button class="btn-agregar" data-id="' + e.id + '"><i class="fas fa-plus"></i></button>';
        });
    }
    else
    {
        m1Consulta.focus();
    }
}

// Delegación: click en botón "Agregar" del Modal 1
if (m1Tbody) {
  m1Tbody.addEventListener('click', function(ev) {
    var btn = ev.target.closest('button.btn-agregar');
    if (!btn) return;
    var tr = btn.closest('tr');
    if (!tr) return;

    var cod = tr.cells[0].innerText.trim();
    // Rellenar campos del formulario principal
    codigo.value = cod;
    nombre.value = itemNombre(cod);
    nombre.disabled = true;
    // Enfocar cantidad y cerrar modal
    cantidad.focus();
    modal1.style.display = 'none';
    // Limpieza del modal
    m1Tbody.innerHTML = '';
    m1Consulta.value = '';
  });
}


// ⬇⬇⬇ Pega esto después de TODO lo que ya tengas

// Permitir presionar Enter dentro de m2Nombre para agregar el producto automáticamente
m2Nombre.addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        m2Agregar.click();
    }
});

// Escuchar clic en botón "Agregar" desde el modal de búsqueda por nombre

// Cerrar la cajita de editar cantidad
function cerrarModalEditar() {
  document.getElementById("modal-3").style.display = "none";
}

/* --- FIX M2: cerrar por ESC y por X --- */
(function () {
  const $ = (id) => document.getElementById(id);
  const visible = (el) => el && el.offsetParent !== null;

  function closeModal2() {
    const m2 = $('modal-2');
    if (!m2) return;
    m2.classList?.remove('open','is-open','activo','show');
    m2.style.display = 'none';
    document.body.classList?.remove('no-scroll');
  }

  // X de M2
  $('m2-cerrar')?.addEventListener('click', closeModal2);

  // ESC prioriza cerrar M3 y luego M2; aquí nos aseguramos M2
  window.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const m2 = $('modal-2');
    if (visible(m2)) closeModal2();
  }, { capture: true });
})();

/* --- FIX M2: limpiar campos principales después de GUARDAR --- */
(function () {
  const $ = (id) => document.getElementById(id);

  function resetCamposItem() {
    // intenta por id; si no, busca por name como fallback
    const codigo   = $('codigo')   || document.querySelector('[name="codigo"]');
    const nombre   = $('nombre')   || document.querySelector('[name="nombre"]');
    const cantidad = $('cantidad') || document.querySelector('[name="cantidad"]');

    if (codigo)   codigo.value   = '';
    if (nombre)   nombre.value   = '';
    if (cantidad) cantidad.value = '';   // si usas “0” por defecto, cambia a "0"

    // opcional: enfoque de nuevo al código
    if (codigo) codigo.focus();
  }

  // Botón GUARDAR de M2 (ajusta el id si usas otro)
  const btnGuardarM2 = document.getElementById('m2-guardar');
  if (btnGuardarM2) {
    btnGuardarM2.addEventListener('click', function () {
      // dejamos que tu lógica de guardar corra primero
      setTimeout(() => {
        resetCamposItem();
        // por si tu handler no cierra, cerramos aquí también
        const m2 = document.getElementById('modal-2');
        if (m2 && m2.offsetParent !== null) {
          m2.classList?.remove('open','is-open','activo','show');
          m2.style.display = 'none';
          document.body.classList?.remove('no-scroll');
        }
      }, 0);
    }, false);
  }
})();


/* Ocultar input auxiliar no usado en Modal 2 */
(function(){
  var m2 = document.getElementById('modal-2');
  if (!m2) return;
  var campos = m2.querySelectorAll('input, select');
  if (campos.length >= 2) {
    campos[1].style.display = 'none';
    // ajustar margen del botón agregar si existe
    var btns = m2.querySelectorAll('button, .btn');
    for (var i=0;i<btns.length;i++){
      var t = (btns[i].textContent||'').trim().toLowerCase();
      if (t === 'agregar'){ btns[i].style.marginLeft = '8px'; break; }
    }
  }
})();

/* === FIX definitivo: ESC cierra Modal 2 (bipeo) === */
(function () {
  const m2 = document.getElementById('modal-2');
  if (!m2) return;

  function isVisible(el) {
    try { return !!el && window.getComputedStyle(el).display !== 'none'; }
    catch (e) { return false; }
  }
  function closeM2() {
    m2.classList.remove('open','is-open','activo','show','mostrar');
    m2.style.display = 'none';
    document.body?.classList?.remove('no-scroll');
  }

  // Captura en fase de captura para que nada lo bloquee
  window.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;

    // Si hay otro modal (ej. modal-3) visible, no toquemos M2
    const m3 = document.getElementById('modal-3');
    const m3Visible = m3 && window.getComputedStyle(m3).display !== 'none';
    if (m3Visible) return;

    if (isVisible(m2)) {
      e.preventDefault();
      e.stopImmediatePropagation();
      closeM2();
    }
  }, true);
})();

// === Números bajo las tallas SOLO para Inventario(1) y Recepción(3) ===
const TALLA_NUM_MAP = { PP:'2', P:'4', M:'6', G:'8', GG:'10', EGG:'12', EXGG:'14', U:'U' };

function refreshTallaNumbers() {
  const tipo = document.getElementById('tipo-informe')?.value;
  const show = (tipo === '1' || tipo === '3'); // 1=Inventario, 3=Recepción

  document.querySelectorAll('#bloque-tallas .talla-box').forEach(box => {
    let small = box.querySelector('.talla-num');

    if (!show) { 
      if (small) small.remove(); // en Devolución los quitamos
      return;
    }

    if (!small) {
      small = document.createElement('small');
      small.className = 'talla-num';
      box.appendChild(small);
    }

    const label = box.querySelector('.talla-label')?.textContent?.trim().toUpperCase() || '';
    small.textContent = TALLA_NUM_MAP[label] || '';
  });
}

// Inicializa y actualiza al cambiar el tipo
(function initTallaNumbers(){
  const run = () => refreshTallaNumbers();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
  document.getElementById('tipo-informe')?.addEventListener('change', refreshTallaNumbers);
})();

// === Mostrar "(motivo)" en negrita en la columna PRODUCTO cuando es DEVOLUCIÓN (versión sin bucles) ===
(function () {
  let pintando = false;

  function pintar() {
    if (pintando) return;            // evita reentradas del observer
    pintando = true;
    try {
      const tipo = document.getElementById('tipo-informe')?.value;
      const tbody = document.querySelector('#tabla tbody');
      if (!tbody) return;

      // Recorre filas y sincroniza el "(motivo)" SOLO si hace falta
      tbody.querySelectorAll('tr').forEach(tr => {
        const tdProducto = tr.querySelector('td.col-2'); // PRODUCTO
        const tdEstado   = tr.querySelector('td.col-6'); // ESTADO (oculto)
        if (!tdProducto || !tdEstado) return;

        const tagActual = tdProducto.querySelector('.estado-tag');

        // Si no es Devolución, limpia y sigue
        if (tipo !== '2') { if (tagActual) tagActual.remove(); return; }

        const valor = (tdEstado.textContent || '').trim();
        const texto = (valor && valor !== '0') ? ` (${valor})` : '';

        // Si no hay motivo → borra si existía y sigue
        if (!texto) { if (tagActual) tagActual.remove(); return; }

        // Si ya hay y es igual → no toques el DOM
        if (tagActual) {
          if (tagActual.textContent !== texto) tagActual.textContent = texto;
        } else {
          const strong = document.createElement('strong');
          strong.className = 'estado-tag';
          strong.textContent = texto;
          tdProducto.appendChild(strong);
        }
      });
    } finally {
      pintando = false;
    }
  }

  const run = () => requestAnimationFrame(pintar);

  // inicial
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }

  // al cambiar tipo de informe
  document.getElementById('tipo-informe')?.addEventListener('change', run);

  // observar cambios en la tabla (añadir/editar/borrar filas)
  const tbody = document.querySelector('#tabla tbody');
  if (tbody) {
    const mo = new MutationObserver(() => run());
    // sin characterData para evitar demasiados triggers; con subtree para nuevas celdas/filas
    mo.observe(tbody, { childList: true, subtree: true });
  }
})();

// --- ATAJOS DE TECLADO ---
// Enter = Agregar (cuando estás en inputs); Ctrl+P/Cmd+P = Generar PDF
(function(){
  const isTextInput = (el) => {
    if (!el) return false;
    const tag = el.tagName?.toLowerCase();
    return tag === 'input' || tag === 'textarea' || el.isContentEditable;
  };

  document.addEventListener('keydown', function(e){
    const t = e.target;

    // Ctrl+P o Cmd+P => Generar PDF con tu función actual
    if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
      e.preventDefault();
      if (typeof exportarPDFConTallasSiCorresponde === 'function') {
        exportarPDFConTallasSiCorresponde();
      }
      return;
    }

    // Enter => clic en "Agregar" si estás escribiendo en algún input
    if (e.key === 'Enter') {
      if (t && t.tagName?.toLowerCase() === 'textarea') return; // no en textarea
      if (isTextInput(t)) {
        const btn = document.getElementById('boton-agregar');
        if (btn) {
          e.preventDefault();
          btn.click();
        }
      }
    }
  });
})();

// --- ORDENAR LISTA DE DISTRIBUIDORES ALFABÉTICAMENTE ---
document.addEventListener("DOMContentLoaded", function() {
  const select = document.getElementById("distribuidor");
  if (!select) return; // seguridad por si no existe
  const opciones = Array.from(select.querySelectorAll("option:not([value=''])"));
  opciones.sort((a, b) => a.text.localeCompare(b.text, 'es', { sensitivity: 'base' }));
  select.innerHTML = '<option value="">Seleccione un distribuidor</option>';
  opciones.forEach(op => select.appendChild(op));
  select.value = ""; // Fuerza que quede sin selección al terminar de ordenar
});








