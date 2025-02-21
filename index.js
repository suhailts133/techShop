const nums = [ 1,2,3,4,5]
for(let i = 0; i< nums.length; i++){
    if(nums[i] % 2 === 0){
        let temp = nums.splice(nums[i], 1);
        nums.unshift(nums[temp])
    }
}

console.log(nums);
