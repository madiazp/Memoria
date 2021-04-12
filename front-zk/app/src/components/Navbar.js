import React from 'react';
import {Link} from 'react-router-dom';

const Navbar = () => {
    return (
<nav class="navbar navbar-expand-lg navbar-dark bg-dark mb-3">
  <div class="container-fluid">
    <a class="navbar-brand">Demo</a>
    <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
        <ul class="navbar-nav me-auto my-2 my-lg-0 navbar-nav-scroll">
        <li class="nav-item">
        <Link class="nav-link" to="/vote">Votar</Link>
        </li>
        <li class="nav-item">
        <Link class="nav-link" to="/register">Registrar Id</Link>
        </li>
        <li class="nav-item">
        <Link class="nav-link" to="/admin">Administrar</Link>
        </li>
        </ul>
    </div>
  </div>
</nav>)
};

export default Navbar;
