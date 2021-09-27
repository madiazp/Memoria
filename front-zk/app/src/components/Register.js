import React, { useState } from 'react';
import genId from '../utils/genId';
import apiccHelper from '../helpers/apicc';

const Register = () => {
  const [toHash, setToHash] = useState("");
  const [result, setResult] = useState("");
  return (
      <div class="container">
        <div class = "row">
          <h5 class="display-3"> Registro de identidad</h5>
        </div>
        <div class="row g-3 align-items-center">
            <div class="col-auto">
                <label for="hasherInput" class = "col-form-label"> Inserte secreto </label>
            </div>
          <input id="hasherInput" value={toHash} onChange={evt => setToHash(evt.target.value)} />
        <button type="button" class="btn btn-secondary" onClick={ async () => {
            const outHash = await genId(toHash);
            const res = await apiccHelper.registerId(outHash);
            setResult(outHash);
            alert(res.data.payload);
        }
        }>
        Registrar
         </button>
      <div>
      <p>
      {result}
      </p>
      </div>
      </div>
    </div>
  )
}

export default Register;
