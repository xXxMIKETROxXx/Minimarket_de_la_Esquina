import { useState } from 'react';
import { REGIONES, validateEmail, validateEmailDomain, validatePassword, validateRun } from '../data/tiendaData.js';

export function RegionFields({ region, comuna, onRegion, onComuna, prefix = '' }) {
  const active = REGIONES[region] ? region : 'metropolitana';
  return <>
    <label className="form-label" htmlFor={`${prefix}region`}>Región</label>
    <select className="form-select mb-3" id={`${prefix}region`} value={active} onChange={(event) => onRegion(event.target.value)}>{Object.entries(REGIONES).map(([key, item]) => <option value={key} key={key}>{item.nombre}</option>)}</select>
    <label className="form-label" htmlFor={`${prefix}comuna`}>Comuna</label>
    <select className="form-select mb-3" id={`${prefix}comuna`} value={REGIONES[active].comunas.includes(comuna) ? comuna : REGIONES[active].comunas[0]} onChange={(event) => onComuna(event.target.value)}>{REGIONES[active].comunas.map((item) => <option key={item}>{item}</option>)}</select>
  </>;
}

export function AccountForm({ initial = {}, submitLabel, onSubmit, withRole = false, includeRun = true }) {
  const [form, setForm] = useState({ run: '', nombre: '', apellidos: '', correo: '', password: '', fecha: '', region: 'metropolitana', comuna: 'Santiago', direccion: '', tipo: 'Cliente', ...initial });
  const [error, setError] = useState('');
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  async function submit(event) {
    event.preventDefault();
    setError('');
    if ((includeRun && !validateRun(form.run)) || !form.nombre.trim() || !form.apellidos.trim() || !validateEmail(form.correo) || !validateEmailDomain(form.correo) || !validatePassword(form.password) || !form.direccion.trim()) {
      setError(includeRun && !validateRun(form.run) ? 'El RUN no es válido. Escríbelo sin puntos ni guion.' : 'Revisa los campos obligatorios, el correo permitido y la contraseña de 4 a 10 caracteres.');
      return;
    }
    const result = await onSubmit(form);
    if (result !== false && result !== null) setError('');
  }

  return <form className="form-panel" onSubmit={submit} noValidate>
    {error && <div className="alert alert-danger" role="alert">{error}</div>}
    {includeRun && <><label className="form-label" htmlFor="account-run">RUN</label><input id="account-run" className="form-control mb-3" value={form.run} maxLength="9" placeholder="190110222" onChange={(event) => update('run', event.target.value)} required /></>}
    <div className="row g-3"><div className="col-md-6"><label className="form-label" htmlFor="account-name">Nombre</label><input id="account-name" className="form-control" value={form.nombre} maxLength="50" onChange={(event) => update('nombre', event.target.value)} required /></div><div className="col-md-6"><label className="form-label" htmlFor="account-surname">Apellidos</label><input id="account-surname" className="form-control" value={form.apellidos} maxLength="100" onChange={(event) => update('apellidos', event.target.value)} required /></div></div>
    <label className="form-label mt-3" htmlFor="account-email">Correo</label><input id="account-email" type="email" className="form-control" value={form.correo} maxLength="100" onChange={(event) => update('correo', event.target.value)} required />
    <label className="form-label mt-3" htmlFor="account-password">Contraseña (4 a 10 caracteres)</label><input id="account-password" type="password" className="form-control" value={form.password} minLength="4" maxLength="10" onChange={(event) => update('password', event.target.value)} required />
    <label className="form-label mt-3" htmlFor="account-birthday">Fecha de nacimiento</label><input id="account-birthday" type="date" className="form-control" value={form.fecha} onChange={(event) => update('fecha', event.target.value)} />
    <RegionFields region={form.region} comuna={form.comuna} onRegion={(region) => setForm((current) => ({ ...current, region, comuna: REGIONES[region].comunas[0] }))} onComuna={(comuna) => update('comuna', comuna)} prefix="account-" />
    <label className="form-label" htmlFor="account-address">Dirección</label><textarea id="account-address" className="form-control mb-3" value={form.direccion} maxLength="300" onChange={(event) => update('direccion', event.target.value)} required />
    {withRole && <><label className="form-label" htmlFor="account-role">Tipo de usuario</label><select id="account-role" className="form-select mb-3" value={form.tipo} onChange={(event) => update('tipo', event.target.value)}><option>Cliente</option><option>Vendedor</option><option>Administrador</option></select></>}
    <button className="btn btn-success" type="submit">{submitLabel}</button>
  </form>;
}

export function LoginForm({ onLogin }) {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  async function submit(event) {
    event.preventDefault();
    setError('');
    if (!validateEmail(correo) || !validateEmailDomain(correo) || !validatePassword(password)) {
      setError('Ingresa un correo permitido y una contraseña de 4 a 10 caracteres.');
      return;
    }
    const ok = await onLogin(correo, password);
    if (!ok) setError('Correo o contraseña incorrectos.');
  }
  return <form className="form-panel" onSubmit={submit} noValidate>
    {error && <div className="alert alert-danger" role="alert">{error}</div>}
    <label className="form-label" htmlFor="login-email">Correo</label><input id="login-email" type="email" className="form-control mb-3" value={correo} onChange={(event) => setCorreo(event.target.value)} required />
    <label className="form-label" htmlFor="login-password">Contraseña</label><input id="login-password" type="password" className="form-control mb-3" value={password} onChange={(event) => setPassword(event.target.value)} required />
    <button type="submit" className="btn btn-success">Ingresar</button>
  </form>;
}

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  function submit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = form.get('correo');
    if (!String(form.get('nombre')).trim() || !String(form.get('asunto')).trim() || !String(form.get('mensaje')).trim() || !validateEmail(email) || !validateEmailDomain(email)) {
      setError('Completa nombre, asunto y mensaje, y usa un correo permitido.');
      setSubmitted(false);
      return;
    }
    setError('');
    setSubmitted(true);
    event.currentTarget.reset();
  }
  return <form className="form-panel" onSubmit={submit} noValidate>
    {error && <div role="alert" className="alert alert-danger">{error}</div>}{submitted && <div role="status" className="alert alert-success">Mensaje recibido. Gracias por contactarnos.</div>}
    <label className="form-label" htmlFor="contact-name">Nombre</label><input id="contact-name" name="nombre" className="form-control mb-3" maxLength="100" required />
    <label className="form-label" htmlFor="contact-email">Correo</label><input id="contact-email" name="correo" type="email" className="form-control mb-3" maxLength="100" required />
    <label className="form-label" htmlFor="contact-subject">Asunto</label><input id="contact-subject" name="asunto" className="form-control mb-3" required />
    <label className="form-label" htmlFor="contact-message">Comentario</label><textarea id="contact-message" name="mensaje" className="form-control mb-3" maxLength="500" required />
    <button className="btn btn-success" type="submit">Enviar mensaje</button>
  </form>;
}