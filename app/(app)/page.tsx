import { BreadcrumbSetter } from "@/components/app-shell/breadcrumb-setter";
import { Card } from "@/components/ui/card";

export default function AppHome() {
    return (
        <div className="grid gap-4 md:grid-cols-3">
            <BreadcrumbSetter crumbs={[{ label: "Dashboard", href: "/" }]} />
            <Card className="h-28"/>
            <Card className="h-28"/>
            <Card className="h-28"/>
            <Card className="md:col-span-3 h-72"/>
        </div>
    )
}