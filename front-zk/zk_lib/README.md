
# ZK Node-JS library  

Esta librería actúa como interfaz para interactuar desde nodejs con métodos implementados en rust.
  
### Requisitos  


### Build  
Este comando generara los archivos necesarios para poder utilizar los métodos implementados desde nodejs.

    wasm-pack build --target nodejs --debug


### Node module  
Entrar en la carpeta pkg creada  al hacer build y ejecutar el siguiente comando:   

    npm pack

esto creara un archivo .tar.gz que podrá ser utilizado para subirlo a npm o instalarlo localmente en algún proyecto que lo requiera.  

### Utilización

|Métodos  | Descripción |
|--|--|
| init_panic_hook() | Este método permite mostrar en consola los errores generados por la librería en rust. Este método debe ser ejecutado al inicio y antes que cualquier otro método de esta librería |
| compute_witness(vec<u8>, &str)| Este método calcula los witness dado un programa en binario y raw witness generados por zokrates |
|generate_proof()| |

###  Ejemplos  

    const filepath  =  path.resolve(__dirname, `../../out`);
    const resp  =  fs.readFileSync(filepath);
    const outbuff = new Uint8Array(resp);
    
    const getWitness  =  async (rut, mt, outbuff) => {
    const witness  =  await  rawWitness(rut, mt);
    comp.init_panic_hook();
    const resp  =  comp.compute_witness(outbuff, witness.toString());
    return resp
    };

  
