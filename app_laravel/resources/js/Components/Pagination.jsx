import { Link } from '@inertiajs/react';

export default function Pagination({ links }) {
  return (
    <nav className="text-center mt-4">
      {links.map((link, key) => (
        link.url ? (
          <Link
            key={key}
            href={link.url}
            className={
              'inline-block px-4 py-2 text-sm leading-none border rounded ' +
              (link.active ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100')
            }
            dangerouslySetInnerHTML={{ __html: link.label }}
          />
        ) : (
          <span
            key={key}
            className={
              'inline-block px-4 py-2 text-sm leading-none border rounded opacity-50 cursor-not-allowed ' +
              (link.active ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-700 border-gray-300')
            }
            dangerouslySetInnerHTML={{ __html: link.label }}
          />
        )
      ))}
    </nav>
  );
} 