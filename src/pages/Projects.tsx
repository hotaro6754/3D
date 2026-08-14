import PageTransition from '../components/transitions/PageTransition';

export default function Projects() {
  return (
    <PageTransition variant="default">
      <div className="page-content" style={{ color: 'var(--fg)', padding: '5vw' }}>
        <h1 style={{ fontFamily: 'var(--font-impact)', fontSize: '4rem' }}>PROJECT ARCHIVE</h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '1.2rem', maxWidth: '600px', marginTop: '2rem' }}>
          List of projects...
        </p>
      </div>
    </PageTransition>
  );
}
