import Link from "next/link";
import { PageLayout } from "@/components/page-layout";
export default function NotFound() {
  return (
    <PageLayout
      title="Page not found"
      description="This page could not be found."
      noindex
    >
      <header className="page-heading">
        <h1>Page not found.</h1>
        <p className="lead">Check the address, or return to the homepage.</p>
        <Link className="button-primary" href="/">
          Go home
        </Link>
      </header>
    </PageLayout>
  );
}
