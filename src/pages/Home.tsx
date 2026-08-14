import PageTransition from '../components/transitions/PageTransition';

export default function Home() {
  return (
    <PageTransition variant="world">
      <div style={{ display: 'none' }}>
        {/* The Home route doesn't render DOM content when in immersive mode, 
            the 3D World handles the visuals. But we wrap it in a transition 
            so the wipe effect plays when navigating here. */}
      </div>
    </PageTransition>
  );
}
