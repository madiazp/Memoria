import React, { useState } from 'react';
import genId from '../utils/genId';
import apiccHelper from '../helpers/apicc';

const Setup = () => {
  const [voteConstant, setVoteConstant] = useState("");
  const [nbrVoters, setNbrVoters] = useState("");
  const [result, setResult] = useState("");
  const [waiting, setWaiting] = useState(false);
  const [refresh, setRefresh] = useState(false);

  const init = async (event) => {
    event.preventDefault();
    setWaiting(true);
    const msg = await apiccHelper.setup(voteConstant, nbrVoters);
    setWaiting(false);
    console.log(msg);
    alert(msg);

  }
  const waitRefresh = async () => {
    setRefresh(true);
    const msg = await apiccHelper.getStadistics();
    setRefresh(false);
    console.log(msg);
    alert(msg);
  }
  return (
      <div class="container-fluid">
        <div class="row">
          <div class="col-11">
            <h5 class="display-4"> Administrar</h5>
          </div>
          <div class="col-4 offset-1">
            <form>
              <div class="mb-3">
                <label class="text-muted"><small>Ingrese constante del sistema </small></label>
                <input class="form-control" id="hasherInput" value={voteConstant} onChange={evt => setVoteConstant(evt.target.value)} />
              </div>       
              <div class="mb-3">
                <label class="text-muted"><small>Inicializar participantes </small></label>
                <div class="row g-3 align-item-center">
                  <div class="col-2">
                    <input type="number" min="0" max="9" class="form-control" value={nbrVoters} onChange={evt => setNbrVoters(evt.target.value)} /> 
                  </div>
                  <div class="col-auto">
                    <button name="submit" type="submit" class="btn btn-info" onClick={ async evn => await init(evn)}>Inicializar</button>
                  </div>
                  <div class="col-auto">{ waiting?
                    <div class="d-flex align-items-center">
                      <strong>Inicializando el Proceso</strong>
                      <div class="spinner-border ml-auto" role="status" aria-hidden="true"></div>
                    </div>
                    :null}
                  </div>
                </div>
              </div>
            </form>
            <form>
              <label class="text-muted"><small>Obtener estadísticas</small></label>
              <div class="row g-2 align-item-center">
                <div class="col-auto">
                  <button name="submit" type="submit" class="btn btn-info" onClick={waitRefresh}>Refrezcar</button>
                </div>
                <div class="col-auto">{ refresh?
                  <div class="d-flex align-items-center">
                    <strong>Obteniendo información</strong>
                    <div class="spinner-border ml-auto" role="status" aria-hidden="true"></div>
                  </div>
                  :null}
                </div>
              </div>
            </form>
          </div>
          <div class="col-7">
          </div>
        </div>
      </div>
  )
};
export default Setup;
