import { getUserDetails } from "@/lib/actions/users";

export default async function page() {
  const userData = await getUserDetails();

  if(!userData) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {Array.isArray(userData) ? (
        userData.map((user, index) => <div key={index}>{JSON.stringify(user)}</div>)
      ) : (
        <div>{JSON.stringify(userData)}</div>
      )}
    </div>
  );
}
