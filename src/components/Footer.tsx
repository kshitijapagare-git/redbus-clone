import { footerColumns } from '../data'

export const FOOTER_TEXT =
  "redBus is the world's largest online bus ticket booking service trusted by over 56 million happy customers globally. redBus offers bus ticket booking through its website, iOS and Android mobile apps for all major routes."

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <nav aria-label="Footer" className="footer-nav">
          <div className="footer-columns">
            {footerColumns.map((column) => (
              <div className="footer-column" key={column.title}>
                <h3 className="footer-column-title">{column.title}</h3>
                <ul className="footer-column-list">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <a href={link.href}>{link.label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </nav>
        <p>{FOOTER_TEXT}</p>
      </div>
    </footer>
  )
}

export default Footer
