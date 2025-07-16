import * as yup from 'yup';

export const roles = [
  { id: 'admin', nombre: 'Administrador' },
  { id: 'medico', nombre: 'Médico' },
  { id: 'enfermera', nombre: 'Enfermera' },
  { id: 'recepcion', nombre: 'Recepción' },
];

export const usuarioSchema = yup.object().shape({
  cedula: yup.string().matches(/^[0-9]{10}$/, 'La cédula debe tener 10 dígitos'),
  nombre: yup.string().required('El nombre es requerido'),
  apellido: yup.string().required('El apellido es requerido'),
  email: yup.string().email('Ingrese un correo válido').required('El correo es requerido'),
  telefono: yup.string().matches(/^[0-9]{10,15}$/, 'Ingrese un teléfono válido'),
  rol: yup.string().required('Seleccione un rol'),
  usuario: yup.string().required('El nombre de usuario es requerido').min(4, 'Mínimo 4 caracteres'),
  password: yup.string().min(6, 'Mínimo 6 caracteres').nullable(),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password'), null], 'Las contraseñas no coinciden')
    .when('password', (password, schema) => {
      return password ? schema.required('Confirme la contraseña') : schema.nullable();
    })
});
