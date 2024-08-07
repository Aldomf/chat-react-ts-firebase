import FirstSectionSidelist from "./FirstSectionSidelist"
import FriendsList from "./FriendsList"
import SearchContact from "./SearchContact"

function Sidelist() {
  return (
    <div className="">
        <FirstSectionSidelist/>
        <SearchContact/>
        <FriendsList/>
    </div>
  )
}

export default Sidelist