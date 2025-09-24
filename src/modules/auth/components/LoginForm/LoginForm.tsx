import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Button, Container, Row, Col, Card, Alert, Spinner } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import { loginUser, selectLoginLoading, selectAuthError, clearError } from '../../../../store/auth/authSlice';
import { useAuth } from '../../context/AuthContext';
import type { LoginRequest } from '../../../../api/auth/types';
import type { AppDispatch } from '../../../../store';

import styles from './LoginForm.module.scss';

// Схема валидации
const loginSchema = yup.object().shape({
  email: yup
    .string()
    .email('Введите корректный email')
    .required('Email обязателен'),
  password: yup
    .string()
    .min(6, 'Пароль должен быть минимум 6 символов')
    .required('Пароль обязателен'),
});

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginFormProps {
  onSuccess?: () => void;
  onRegisterClick?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onRegisterClick }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { setAuth } = useAuth();
  
  // Redux состояние
  const isLoading = useSelector(selectLoginLoading);
  const error = useSelector(selectAuthError);

  // Form состояние
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      // Очищаем предыдущие ошибки
      dispatch(clearError());

      // Отправляем запрос через Redux
      const result = await dispatch(loginUser(data));
      
      if (loginUser.fulfilled.match(result)) {
        // При успешном логине обновляем AuthContext
        setAuth(result.payload.user, result.payload.accessToken);
        
        // Очищаем форму
        reset();
        
        // Callback при успехе
        onSuccess?.();
      }
    } catch (error) {
      console.error('Login form error:', error);
    }
  };

  return (
    <Container fluid className={styles.loginContainer}>
      <Row className="justify-content-center align-items-center min-vh-100">
        <Col xs={12} sm={10} md={8} lg={6} xl={4}>
          <Card className={styles.loginCard}>
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <h2 className={styles.loginTitle}>Вход в систему</h2>
                <p className="text-muted">
                  Войдите в свою учетную запись
                </p>
              </div>

              {error && (
                <Alert 
                  variant="danger" 
                  dismissible 
                  onClose={() => dispatch(clearError())}
                  className="mb-3"
                >
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit(onSubmit)}>
                <Form.Group className="mb-3">
                  <Form.Label>Email адрес</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Введите email"
                    {...register('email')}
                    isInvalid={!!errors.email}
                    className={styles.formControl}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email?.message}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Пароль</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Введите пароль"
                    {...register('password')}
                    isInvalid={!!errors.password}
                    className={styles.formControl}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.password?.message}
                  </Form.Control.Feedback>
                </Form.Group>

                <div className="d-grid mb-3">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={isLoading || isSubmitting}
                    className={styles.submitButton}
                  >
                    {isLoading || isSubmitting ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          className="me-2"
                        />
                        Выполняется вход...
                      </>
                    ) : (
                      'Войти'
                    )}
                  </Button>
                </div>
              </Form>

              <div className="text-center">
                <p className="mb-0">
                  Нет аккаунта?{' '}
                  <Button
                    variant="link"
                    onClick={onRegisterClick}
                    className="p-0 text-decoration-none"
                  >
                    Зарегистрироваться
                  </Button>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginForm;