import { useState } from 'react';
import Page1 from './pages/Page1.jsx';
import Page2 from './pages/Page2.jsx';
import Page3 from './pages/Page3.jsx';

export default function App() {
  const [page, setPage] = useState(1);
  const [location, setLocation] = useState(null);

  const handleLocationSubmit = (loc) => {
    setLocation(loc);
    setPage(3);
  };

  return (
    <>
      {page === 1 && <Page1 onNext={() => setPage(2)} />}
      {page === 2 && (
        <Page2
          onBack={() => setPage(1)}
          onNext={handleLocationSubmit}
        />
      )}
      {page === 3 && (
        <Page3
          location={location}
          onBack={() => setPage(2)}
        />
      )}
    </>
  );
}
