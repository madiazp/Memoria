import React, { useState } from 'react';
import genId from '../utils/genId';
import apiccHelper from '../helpers/apicc';
import voting from '../utils/voting';

const Vote = () => {
  const [toHash, setToHash] = useState("");
  const [result, setResult] = useState("");
  const [candidate, setCandidate] = useState("");
  const [showProgres, setShowProgres] = useState(false);
  const [steps, setSteps] = useState(0);
  const activate = (event) => {
      setShowProgres(true);
      voting(toHash, setSteps, setResult, candidate);
      event.preventDefault();
  };
  const change = (event) => {
      setCandidate(event.target.value);
  }
  const Progres = () => {
      return(
    <div class="col-10">
      <div class="card">
        <ul class="list-group list-group-flush">
         {steps > 0 ?  <li class="list-group-item" >Librería criptográfica importada</li> : null}
         {steps > 1 ?  <li class="list-group-item" >inputs calculados y formateados</li> : null}
         {steps > 2 ?  <li class="list-group-item" >Módulo Zokrates importado </li> : null}
         {steps > 3 ?  <li class="list-group-item" >Artefactos obtenidos </li> : null}
         {steps > 4 ?  <li class="list-group-item" >Artefactos generados </li> : null}
         {steps > 5 ?  <li class="list-group-item" >testigos calculados </li> : null}
         {steps > 6 ?  <li class="list-group-item" >Prueba generada </li> : null}
         {steps < 6 ?  <li class="list-group-item">
                         <div class="clearflex">
                           <div class="spinner-border">
                              <span class="visually-hidden"></span>
                           </div> 
                         </div>
                       </li>: null}
        
        </ul>
      </div>
    </div>
    )
  };
  const radCandidates =
        <div>
          <div class="custom-control custom-radio custom-control-inline">
           <input name="radio" id="radio_0" type="radio" onClick={change} checked={candidate==="Candidato1"} class="custom-control-input" value="Candidato1"/>
           <label for="radio_0" class="custom-control-label muted-text"><small>Candidato 1</small></label>
          </div>
          <div class="custom-control custom-radio custom-control-inline">
           <input name="radio" id="radio_1" type="radio" onClick={change} checked={candidate==="Candidato2"} class="custom-control-input" value="Candidato2"/>
           <label for="radio_1" class="custom-control-label muted-text"><small>Candidato 2</small></label>
          </div>
        </div>
  return (
  <div class="container-fluid">
    <div class="row">
    <div class="col-6">
      <div class="col-sm-11 offset-sm-1">
      <p/>
     <p><h5 class="display-4">  Formulario Votación</h5></p>
      </div>
    <form>
      <div class="form-check">
        <div class="col-md-11 offset-md-1">
            <label class="text-muted"><small>Seleccione candidato</small></label>
        </div>
        <div class="col-md-11 offset-md-1">
          { radCandidates }
        </div>
      </div>
        <div class="col-sm-11 offset-sm-1">
          <div class="row">
            <div class="col-5 col-sm-4">
              <label class="col-lg text-muted"><small>Ingrese su identificador secreto</small></label>
            </div>
            <div class="col-5 col-sm-6">
              <input class="form-input" id="hasherInput" value={toHash} onChange={evt => setToHash(evt.target.value)} />
            </div>
            <div class="col-2 col-sm-2">
              <button name="submit" type="submit" class="btn btn-primary" onClick={activate}>Enviar</button>
            </div>
          </div>
      <div class="col-sm-12">
       <div class="card">
        <div class= "card-header">
          Resultado
        </div>
        <div class="card-body">
          {result}
        </div>
      </div>
    </div>
        </div>
      </form>
    </div>
    <div class="col-6">
      { showProgres? <Progres /> : null }
    </div>
  </div>
</div>
  )
};


export default Vote;
