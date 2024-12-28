import { useState } from 'react'
import CalculadoraIA from './components/CalculadoraIA/CalculadoraIA'
import styled from '@emotion/styled'

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  height: 100%;
  width: 100%;
  background: var(--background-color);

  @media (min-width: 769px) {
    align-items: center;
    justify-content: center;
    padding: 1rem;
  }
`;

const App = () => {
  return (
    <AppContainer>
      <CalculadoraIA />
    </AppContainer>
  )
}

export default App
