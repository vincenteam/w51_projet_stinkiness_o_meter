import "./error404.css"

export function Error404() {
  return (
    <>
      <div className="container">
        <div className="error-code">404</div>
        <div className="message">
          No stinkiness here
        </div>
        <div className="image-container">
          <img src="/src/assets/404.jpg" alt="Anime Character" />
        </div>
      </div>
    </>
  );
}
