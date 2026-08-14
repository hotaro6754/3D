import PageTransition from '../components/transitions/PageTransition';

export default function About() {
  return (
    <PageTransition variant="about">
      <div className="page-content" style={{ color: 'var(--fg)', padding: '5vw' }}>
        <h1 style={{ fontFamily: 'var(--font-impact)', fontSize: '4rem' }}>ABOUT THE GHOST</h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '1.2rem', maxWidth: '600px', marginTop: '2rem' }}>
          This is the 2D DOM overlay for the About section. In immersive mode, this renders 
          on top of the 3D scene (or you can choose to only show it when the user interacts 
          with a specific object in the world).
        </p>
      </div>
    </PageTransition>
  );
}
