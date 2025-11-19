import { LoginForm } from '@/components/login-form'

export function LoginPage() {
  return (
    <div className='grid min-h-svh lg:grid-cols-2'>
      <div className='relative hidden bg-muted lg:block'>
        <img
          src='/img-login.jpeg'
          alt='Image'
          className='absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale'
        />
      </div>
      <div className='flex flex-col gap-4 p-6 md:p-10'>
        <div className='flex justify-center gap-2 md:justify-start'>
          <a href='#' className='flex items-center gap-2 font-bold'>
            <img src='/images/tmmin.png' alt='Image' className='h-20 w-40' />
          </a>
        </div>
        <span className='text-center text-2xl font-bold'>
          " Welcome To HV BATTERY DASHBOARD "
        </span>
        <div className='flex flex-1 items-center justify-center'>
          <div className='w-full max-w-xs'>
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  )
}
