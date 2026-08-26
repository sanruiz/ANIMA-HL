import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const OPEN_SPACE_IMG = "/art/open-space-cover.jpg";
const PROGRAM_IMG = "/art/public-program-cover.jpg";
const COLLECTION_IMG = "/art/joint-effort-cover.jpg";

export default function ArteSections() {
  const t = useTranslations("arte.sections");

  const sections = [
    {
      key: "openSpace",
      label: t("openSpace.label"),
      href: "/arte/espacio-abierto",
      image: OPEN_SPACE_IMG,
    },
    {
      key: "program",
      label: t("program.label"),
      href: "/arte/programa-publico",
      image: PROGRAM_IMG,
    },
    {
      key: "collection",
      label: t("collection.label"),
      href: "/arte/coleccion",
      image: COLLECTION_IMG,
    },
  ];

  return (
    <section className="flex w-full justify-center bg-brand-beige">
      <ul className="m-0 grid w-[95%] max-w-(--width-content) list-none grid-cols-1 gap-8 p-0 py-16 sm:grid-cols-3 lg:py-24">
        {sections.map(({ key, label, href, image }) => (
          <li key={key}>
            <Link href={href} className="group flex flex-col gap-4">
              <div className="relative aspect-4/3 w-full overflow-hidden bg-brand-oscuro/10">
                <Image
                  src={image}
                  alt={label}
                  fill
                  sizes="(min-width: 640px) 33vw, 95vw"
                  className="object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                />
              </div>
              <p className="m-0 text-center font-(family-name:--font-primary) text-xl text-brand-oscuro">
                {label}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
