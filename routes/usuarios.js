import express from 'express';
import { supabase } from '../index.js';
import { generalLimiter } from '../middleware/rateLimiter.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import {
  validateEmail,
  validateNombre,
  handleValidationErrors,
} from '../middleware/validation.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// POST - Registrar nuevo usuario (cliente)
router.post(
  '/registro',
  generalLimiter,
  validateNombre,
  validateEmail,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { nombre, email, telefono, ciudad, distrito, password } = req.body;

    // Verificar si el email ya existe
    const { data: existing } = await supabase
      .from('usuarios')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) {
      return res.status(400).json({
        error: 'El email ya está registrado',
      });
    }

    // Hashear password si fue enviado
    let hashed = null;
    if (password) {
      const saltRounds = 10;
      hashed = await bcrypt.hash(password, saltRounds);
    }

    // Insertar nuevo usuario (no devolver password)
    const { data, error } = await supabase
      .from('usuarios')
      .insert([
        {
          nombre,
          email,
          telefono: telefono || null,
          password: hashed, // nueva columna (puede ser null)
          ciudad: ciudad || null,
          distrito: distrito || null,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Responder sin exponer password
    const safeUser = {
      id: data.id,
      nombre: data.nombre,
      email: data.email,
      telefono: data.telefono,
      ciudad: data.ciudad,
      distrito: data.distrito,
    };

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      usuario: safeUser,
    });
  })
);

// GET - Obtener perfil de usuario por email (no seleccionar password)
router.get(
  '/:email',
  generalLimiter,
  asyncHandler(async (req, res) => {
    const { email } = req.params;

    if (!email.includes('@')) {
      return res.status(400).json({ error: 'Email inválido' });
    }

    const { data, error } = await supabase
      .from('usuarios')
      // seleccionar campos públicos explícitamente (excluir password)
      .select('id, nombre, email, telefono, ciudad, distrito, direccion, referencia_domicilio')
      .eq('email', email)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(data);
  })
);

// PUT - Actualizar perfil de usuario (soporta cambio de password)
router.put(
  '/:id',
  generalLimiter,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { nombre, telefono, ciudad, distrito, direccion, referencia_domicilio, password } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const updateData = {};
    if (nombre) updateData.nombre = nombre.trim();
    if (telefono) updateData.telefono = telefono;
    if (ciudad) updateData.ciudad = ciudad.trim();
    if (distrito) updateData.distrito = distrito.trim();
    if (direccion) updateData.direccion = direccion.trim();
    if (referencia_domicilio) updateData.referencia_domicilio = referencia_domicilio.trim();

    // Si envían password, hashearla antes de actualizar
    if (password) {
      const saltRounds = 10;
      updateData.password = await bcrypt.hash(password, saltRounds);
    }

    const { data, error } = await supabase
      .from('usuarios')
      .update(updateData)
      .eq('id', parseInt(id))
      .select()
      .single();

    if (error) throw error;

    // No devolver password en la respuesta
    const safeUser = {
      id: data.id,
      nombre: data.nombre,
      email: data.email,
      telefono: data.telefono,
      ciudad: data.ciudad,
      distrito: data.distrito,
      direccion: data.direccion,
      referencia_domicilio: data.referencia_domicilio,
    };

    res.json({
      message: 'Perfil actualizado correctamente',
      usuario: safeUser,
    });
  })
);

export default router;