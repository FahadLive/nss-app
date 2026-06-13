import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import TopAppBar from "@/components/TopAppBar";
import BottomNavBar from "@/components/BottomNavBar";
import NotificationPrompt from "@/components/NotificationPrompt";

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col">
      <TopAppBar showBack />
      <main className="flex-grow pt-24 pb-12 px-container-margin max-w-lg mx-auto w-full">
        {profile?.approval_status === "pending" && (
          <>
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-fixed rounded-full mb-6">
                <span className="material-symbols-outlined text-[40px] text-primary">
                  verified_user
                </span>
              </div>
              <h2 className="text-2xl font-bold text-on-surface mb-3">
                Awaiting approval.
              </h2>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                The Executive Committee (Execom) is verifying your details to
                ensure the integrity of our volunteer base.
              </p>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 mb-8 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase text-on-surface-variant">
                  Status
                </span>
                <span className="flex items-center gap-2 text-xs font-bold text-secondary bg-secondary-container/10 px-3 py-1 rounded-full border border-secondary/20">
                  <span className="w-2 h-2 bg-secondary rounded-full status-pulse" />
                  PENDING
                </span>
              </div>
              <div className="relative flex flex-col gap-6">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
                      <span className="material-symbols-outlined text-sm">
                        check
                      </span>
                    </div>
                    <div className="w-0.5 h-full bg-primary" />
                  </div>
                  <div className="pb-6">
                    <h4 className="text-sm font-bold text-on-surface">
                      Sign-in Successful
                    </h4>
                    <p className="text-xs text-on-surface-variant">
                      Authenticated via Google.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center text-primary bg-surface">
                      <span
                        className="material-symbols-outlined text-sm"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        hourglass_top
                      </span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-on-surface">
                      Verification
                    </h4>
                    <p className="text-xs text-on-surface-variant">
                      Being reviewed by department head.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {profile?.approval_status === "rejected" && (
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-error-container rounded-full mb-6">
              <span className="material-symbols-outlined text-[40px] text-on-error-container">
                cancel
              </span>
            </div>
            <h2 className="text-2xl font-bold text-on-surface mb-3">
              Registration Rejected
            </h2>
            <p className="text-sm text-on-surface-variant">
              Please contact the Execom for more information.
            </p>
          </div>
        )}

        {profile?.approval_status === "approved" && (
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <span className="material-symbols-outlined text-[40px] text-green-600">
                verified
              </span>
            </div>
            <h2 className="text-2xl font-bold text-on-surface mb-3">
              Approved Volunteer
            </h2>
            <p className="text-sm text-on-surface-variant">
              You are a verified member of NSS Unit 185.
            </p>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase text-on-surface-variant px-1">
            Your Information
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 bg-white/80 backdrop-blur p-5 rounded-xl border border-outline-variant">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-surface-container-high rounded-full flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">person</span>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant">Full Name</p>
                  <p className="font-bold text-on-surface">
                    {profile?.full_name ?? "N/A"}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur p-5 rounded-xl border border-outline-variant">
              <p className="text-xs text-on-surface-variant">Department</p>
              <p className="font-bold text-on-surface">
                {profile?.department ?? "N/A"}
              </p>
            </div>
            <div className="bg-white/80 backdrop-blur p-5 rounded-xl border border-outline-variant">
              <p className="text-xs text-on-surface-variant">Year</p>
              <p className="font-bold text-on-surface">
                {profile?.year ?? "N/A"}
              </p>
            </div>
          </div>
          <div className="mt-8 space-y-3">
            <NotificationPrompt />
            <form
              action={async () => {
                "use server";
                const c = await cookies();
                const s = createClient(c);
                await s.auth.signOut();
                redirect("/login");
              }}
            >
              <button className="w-full bg-transparent border border-outline text-on-surface-variant font-bold py-3 rounded-xl hover:bg-surface-container-low transition-colors">
                Log Out
              </button>
            </form>
          </div>
        </div>
      </main>
      <BottomNavBar activeTab="profile" />
    </div>
  );
}
