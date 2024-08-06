import FirstSectionSidelist from "./FirstSectionSidelist"
import FriendsList from "./FriendsList"
import SearchContact from "./SearchContact"

function Sidelist() {
  return (
    <div className="border border-blue-500">
        <FirstSectionSidelist/>
        <SearchContact/>
        <FriendsList/>
    </div>
  )
}

export default Sidelist