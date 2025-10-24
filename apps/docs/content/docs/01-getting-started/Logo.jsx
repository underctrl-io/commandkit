import React from 'react';

export default function Logo() {
  return <>
    <img src={'/img/ckit_logo_d.svg'} width="60%" alt="CommandKit Logo" className='dark:hidden' data-info='light logo' />
    <img src={'/img/ckit_logo.svg'} width="60%" alt="CommandKit Logo" className='hidden dark:block' data-info='dark logo' />
  </>
}
