import React from 'react';
import { useColorMode } from '@docusaurus/theme-common';

export default function Logo() {
  const { colorMode } = useColorMode();
  const logo =
    colorMode === 'dark' ? '/img/ckit_logo.svg' : '/img/ckit_logo_d.svg';
  return <img src={logo} width="60%" alt="CommandKit Logo" />;
}
