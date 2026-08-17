import { Link } from 'react-router-dom';

export default function PageHeader({ title, breadcrumbs }) {
  return (
    <div className="py-2 mb-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        <div className="flex items-center text-sm italic font-normal text-purple-950">
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.label} className="flex items-center">
              {index > 0 && <span className="mx-1.5 text-gray-400 font-normal">/</span>}
              {crumb.path && crumb.path !== '#' ? (
                <Link to={crumb.path} className="hover:underline transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className={index === breadcrumbs.length - 1 ? 'text-purple-950 font-medium' : 'text-purple-800'}>
                  {crumb.label}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}