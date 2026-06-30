import { StudentForm } from "@/components/students/student-form";
import { StudentList } from "@/components/students/student-list";
import {
  listStudentCompetitionOptions,
  listStudents,
} from "@/features/students/queries";

export default async function StudentsPage() {
  const [students, competitionOptions] = await Promise.all([
    listStudents(),
    listStudentCompetitionOptions(),
  ]);

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="max-w-3xl">
          <p className="text-sm font-medium text-primary">Participants</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-normal md:text-3xl">
            Student List
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground md:text-base">
            Manage student records and assign each student to one or more
            dynamic competitions. Multi-competition status is detected from the
            current assignments.
          </p>
        </div>
      </div>

      <StudentForm mode="create" competitionOptions={competitionOptions} />
      <StudentList
        students={students}
        competitionOptions={competitionOptions}
      />
    </section>
  );
}
