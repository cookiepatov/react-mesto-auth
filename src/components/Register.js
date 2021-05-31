import {React, useEffect} from 'react';
import {useFormAndValidation} from '../utils/validator';
import {authValidation} from '../utils/constants';
import {Link, withRouter} from 'react-router-dom';

function Register(props) {
  const { loggedIn, onRegister } = props;
  const { inputClass, errorClass } = authValidation;
  const { values,
    handleChange,
    errors,
    inputsClasses,
    errorsClasses,
    isValid,
    resetForm } = useFormAndValidation(true);

  useEffect(() => {
    resetForm(
      { email: '', password: '' },
      { email: '', password: '' },
      { email: inputClass, password: inputClass },
      { email: errorClass, password: errorClass });
  }, [loggedIn]);


  function handleSubmit(e) {
    e.preventDefault();
    onRegister(values);

  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2 className="auth-form__header">
        Регистрация
        </h2>
      <fieldset className="auth-form__inputs">
        <input
          className={inputsClasses.email}
          id="register-email-input"
          type="email"
          required
          name="email"
          minLength="2"
          maxLength="30"
          placeholder="Email"
          value={values.email}
          onChange={handleChange}>
        </input>
        <span className={errorsClasses.email}>{errors.email}</span>
        <input
          className={inputsClasses.password}
          id="register-password-input"
          type="password"
          required
          name="password"
          minLength="7"
          maxLength="30"
          placeholder="Пароль"
          value={values.password}
          onChange={handleChange}>
        </input>
        <span className={errorsClasses.password}>{errors.password}</span>
      </fieldset>
      <button className="auth-form__button" type="submit" disabled={!isValid}>Зарегистрироваться</button>
      <p className="auth-form__bottom-message">Уже зарегистрированы? <Link className="auth__link" to="/sign-in"> Войти </Link></p>
    </form>
  );
}

export default withRouter(Register);
