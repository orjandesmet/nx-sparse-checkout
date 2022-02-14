// eslint-disable-next-line @typescript-eslint/no-unused-vars
import styles from './app.module.css';
import NxWelcome from './nx-welcome';
import {reactLib} from '@example/react-lib';

export function App() {
  return (
    <>
      <NxWelcome title="some-react-app" />
      {reactLib()}
      <div />
    </>
  );
}

export default App;
