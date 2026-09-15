import React, { useEffect } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Formik, FormikHelpers } from 'formik';
import { object, ref, string } from 'yup';
import tw from 'twin.macro';
import Field from '@/components/elements/Field';
import Button from '@/components/elements/Button';
import LoginFormContainer from '@/components/auth/LoginFormContainer';
import register from '@/api/auth/register';
import useFlash from '@/plugins/useFlash';

interface Values {
    username: string;
    email: string;
    name_first: string;
    name_last: string;
    password: string;
    password_confirmation: string;
}

export default ({ history }: RouteComponentProps) => {
    const { clearFlashes, clearAndAddHttpError, addFlash } = useFlash();

    useEffect(() => clearFlashes(), []);

    const onSubmit = (values: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearFlashes();
        register(values)
            .then(() => {
                addFlash({
                    key: 'register',
                    type: 'success',
                    message: 'Account created. Sign in to access your Drex Hosting dashboard.',
                });
                history.push('/auth/login', { registrationComplete: true });
            })
            .catch((error) => {
                setSubmitting(false);
                clearAndAddHttpError({ error });
            });
    };

    return (
        <Formik
            onSubmit={onSubmit}
            initialValues={{ username: '', email: '', name_first: '', name_last: '', password: '', password_confirmation: '' }}
            validationSchema={object().shape({
                username: string().required('Choose a username.'),
                email: string().email('Enter a valid email address.').required('Email is required.'),
                name_first: string().required('First name is required.'),
                name_last: string().required('Last name is required.'),
                password: string().min(8, 'Use at least 8 characters.').required('Password is required.'),
                password_confirmation: string().oneOf([ref('password')], 'Passwords must match.').required('Confirm your password.'),
            })}
        >
            {({ isSubmitting }) => (
                <LoginFormContainer title={'Create your Drex Hosting account'} css={tw`w-full flex`}>
                    <div css={tw`grid gap-4 md:grid-cols-2`}>
                        <Field light type={'text'} label={'First Name'} name={'name_first'} disabled={isSubmitting} />
                        <Field light type={'text'} label={'Last Name'} name={'name_last'} disabled={isSubmitting} />
                    </div>
                    <div css={tw`mt-4`}>
                        <Field light type={'text'} label={'Username'} name={'username'} disabled={isSubmitting} />
                    </div>
                    <div css={tw`mt-4`}>
                        <Field light type={'email'} label={'Email'} name={'email'} disabled={isSubmitting} />
                    </div>
                    <div css={tw`mt-4`}>
                        <Field light type={'password'} label={'Password'} name={'password'} disabled={isSubmitting} />
                    </div>
                    <div css={tw`mt-4`}>
                        <Field light type={'password'} label={'Confirm Password'} name={'password_confirmation'} disabled={isSubmitting} />
                    </div>
                    <div css={tw`mt-6`}>
                        <Button type={'submit'} size={'xlarge'} isLoading={isSubmitting} disabled={isSubmitting}>Create Account</Button>
                    </div>
                    <div css={tw`mt-6 text-center`}>
                        <Link
                            to={'/auth/login'}
                            css={tw`text-xs text-neutral-500 tracking-wide no-underline uppercase hover:text-neutral-600`}
                        >
                            Already have an account? Log in
                        </Link>
                    </div>
                </LoginFormContainer>
            )}
        </Formik>
    );
};
